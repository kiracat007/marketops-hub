-- READ-ONLY verification for the MarketOps Hub V2 migration.

-- 1. All five tables must exist.
select expected.table_name, to_regclass('public.' || expected.table_name) is not null as exists
from (values ('campaigns'),('partners'),('activities'),('leads'),('opportunities')) expected(table_name);

-- 2. Leads relationship columns must be nullable UUID columns.
select column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'leads'
  and column_name in ('campaign_id','activity_id','partner_id')
order by column_name;

-- 3. Explicit Leads foreign keys and definitions.
select c.conname as constraint_name, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid = 'public.leads'::regclass
  and c.conname in ('fk_leads_campaign','fk_leads_activity','fk_leads_partner')
order by c.conname;

-- 4. Required V2 indexes.
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_marketops_activities_campaign_id','idx_marketops_activities_partner_id',
    'idx_marketops_leads_campaign_id','idx_marketops_leads_activity_id','idx_marketops_leads_partner_id',
    'idx_marketops_opportunities_campaign_id','idx_marketops_opportunities_lead_id'
  )
order by indexname;

-- 5. RLS must be enabled and the project policy must exist for anon.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('campaigns','partners','activities','leads','opportunities')
order by c.relname;

select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('campaigns','partners','activities','leads','opportunities')
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('campaigns','partners','activities','leads','opportunities')
  and grantee in ('anon','authenticated')
order by table_name, grantee, privilege_type;

-- 5b. Direct anon privileges: every table must have exactly CRUD and no elevated table privileges.
with expected(table_name, privilege_type) as (
  select table_name, privilege_type
  from (values ('campaigns'),('partners'),('activities'),('leads'),('opportunities')) tables(table_name)
  cross join (values ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) privileges(privilege_type)
), actual as (
  select table_name, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public' and grantee = 'anon'
    and table_name in ('campaigns','partners','activities','leads','opportunities')
)
select
  expected.table_name,
  expected.privilege_type,
  (actual.privilege_type is not null) as granted_as_expected
from expected
left join actual using (table_name, privilege_type)
order by expected.table_name, expected.privilege_type;

-- 5c. This result must return no rows: anon must not have direct privileges beyond CRUD.
select table_name, privilege_type as unexpected_anon_privilege
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon'
  and table_name in ('campaigns','partners','activities','leads','opportunities')
  and privilege_type not in ('SELECT','INSERT','UPDATE','DELETE')
order by table_name, privilege_type;

-- 5d. This result must return no rows: authenticated is not used in the current Demo.
select table_name, privilege_type as unexpected_authenticated_privilege
from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'authenticated'
  and table_name in ('campaigns','partners','activities','leads','opportunities')
order by table_name, privilege_type;

-- 5e. Effective privilege check, including privileges inherited through role membership or PUBLIC.
-- CRUD must be true. TRUNCATE, REFERENCES, and TRIGGER must be false.
select
  table_name,
  has_table_privilege('anon', format('public.%I', table_name), 'SELECT') as anon_select,
  has_table_privilege('anon', format('public.%I', table_name), 'INSERT') as anon_insert,
  has_table_privilege('anon', format('public.%I', table_name), 'UPDATE') as anon_update,
  has_table_privilege('anon', format('public.%I', table_name), 'DELETE') as anon_delete,
  has_table_privilege('anon', format('public.%I', table_name), 'TRUNCATE') as anon_truncate_must_be_false,
  has_table_privilege('anon', format('public.%I', table_name), 'REFERENCES') as anon_references_must_be_false,
  has_table_privilege('anon', format('public.%I', table_name), 'TRIGGER') as anon_trigger_must_be_false,
  (
    has_table_privilege('authenticated', format('public.%I', table_name), 'SELECT')
    or has_table_privilege('authenticated', format('public.%I', table_name), 'INSERT')
    or has_table_privilege('authenticated', format('public.%I', table_name), 'UPDATE')
    or has_table_privilege('authenticated', format('public.%I', table_name), 'DELETE')
    or has_table_privilege('authenticated', format('public.%I', table_name), 'TRUNCATE')
    or has_table_privilege('authenticated', format('public.%I', table_name), 'REFERENCES')
    or has_table_privilege('authenticated', format('public.%I', table_name), 'TRIGGER')
  ) as authenticated_has_any_listed_privilege_must_be_false
from (values ('campaigns'),('partners'),('activities'),('leads'),('opportunities')) tables(table_name)
order by table_name;

-- 6. Record counts.
select 'campaigns' as table_name, count(*) as row_count from public.campaigns
union all select 'partners', count(*) from public.partners
union all select 'activities', count(*) from public.activities
union all select 'leads', count(*) from public.leads
union all select 'opportunities', count(*) from public.opportunities;

-- 7. Thailand Q4 Seed relationship chain. Empty before optional Seed is expected.
select
  c.name as campaign,
  a.name as activity,
  l.name as lead,
  o.name as opportunity,
  o.stage,
  o.value
from public.campaigns c
left join public.activities a on a.campaign_id = c.id
left join public.leads l on l.campaign_id = c.id and (l.activity_id = a.id or l.activity_id is null)
left join public.opportunities o on o.campaign_id = c.id and o.lead_id = l.id
where c.id = '10000000-0000-4000-8000-000000000001'
order by a.name, l.name, o.name;

-- 8. Orphan foreign keys. Every count must be zero.
select 'activities.campaign_id' as relationship, count(*) as orphan_count
from public.activities a left join public.campaigns c on c.id = a.campaign_id
where a.campaign_id is not null and c.id is null
union all select 'activities.partner_id', count(*)
from public.activities a left join public.partners p on p.id = a.partner_id
where a.partner_id is not null and p.id is null
union all select 'leads.campaign_id', count(*)
from public.leads l left join public.campaigns c on c.id = l.campaign_id
where l.campaign_id is not null and c.id is null
union all select 'leads.activity_id', count(*)
from public.leads l left join public.activities a on a.id = l.activity_id
where l.activity_id is not null and a.id is null
union all select 'leads.partner_id', count(*)
from public.leads l left join public.partners p on p.id = l.partner_id
where l.partner_id is not null and p.id is null
union all select 'opportunities.campaign_id', count(*)
from public.opportunities o left join public.campaigns c on c.id = o.campaign_id
where o.campaign_id is not null and c.id is null
union all select 'opportunities.lead_id', count(*)
from public.opportunities o left join public.leads l on l.id = o.lead_id
where o.lead_id is not null and l.id is null;

-- 9. Negative financial values. Every count must be zero.
select 'campaigns.budget/spend' as check_name, count(*) as invalid_count from public.campaigns where budget < 0 or spend < 0
union all select 'activities.budget/spend', count(*) from public.activities where budget < 0 or spend < 0
union all select 'leads.potential_value', count(*) from public.leads where potential_value < 0
union all select 'opportunities.value', count(*) from public.opportunities where value < 0;

-- 10. Invalid statuses. Every count must be zero.
select 'campaigns.status' as check_name, count(*) as invalid_count from public.campaigns where status not in ('Planning','Active','Completed','Paused')
union all select 'partners.status', count(*) from public.partners where status not in ('Active','Inactive','Prospect')
union all select 'activities.status', count(*) from public.activities where status not in ('Planning','Upcoming','In Progress','Completed','Cancelled')
union all select 'leads.status', count(*) from public.leads where status not in ('New','Contacted','Qualified','Opportunity','Won','Lost')
union all select 'opportunities.stage', count(*) from public.opportunities where stage not in ('Discovery','Proposal','Negotiation','Won','Lost');

-- 11. Duplicate Seed business names. No row should be returned.
select 'campaigns' as table_name, name, count(*) as duplicate_count
from public.campaigns where name = 'Thailand Q4 Market Expansion' group by name having count(*) > 1
union all
select 'partners', name, count(*) from public.partners
where name in ('Thailand PR Agency','Bangkok Distributor','Tech Media Partner') group by name having count(*) > 1
union all
select 'activities', name, count(*) from public.activities
where name in ('Techsauce Expo','Thailand Partner Webinar','Bangkok Dealer Demo') group by name having count(*) > 1
union all
select 'leads', name, count(*) from public.leads
where name in ('Anan Chai','Pim Suda','Nok Kanya','Beam Viroj','Krit Som','Dao Mali','Mew Araya','Ton Niran') group by name having count(*) > 1
union all
select 'opportunities', name, count(*) from public.opportunities
where name in ('Siam Robotics Expansion','Eastern Manufacturing Rollout','Bangkok Components Pilot','CPS Platform Upgrade') group by name having count(*) > 1;
