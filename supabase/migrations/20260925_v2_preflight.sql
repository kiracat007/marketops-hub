-- READ-ONLY preflight for the MarketOps Hub V1 -> V2 migration.
-- Review every result set before running 20260925_v2_relational_model.sql.

-- 1. Existing tables.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('campaigns','partners','activities','leads','opportunities')
order by table_name;

-- 2. Leads columns and types.
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'leads'
order by ordinal_position;

-- 3. Leads constraints, including their full definitions.
select c.conname as constraint_name, c.contype as constraint_type, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid = to_regclass('public.leads')
order by c.conname;

-- 4. Existing indexes on Leads.
select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'leads'
order by indexname;

-- 5. Existing Leads RLS status and policies. Look for duplicate permissive policies.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'leads';

select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'leads'
order by policyname;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'leads'
  and grantee in ('anon','authenticated')
order by grantee, privilege_type;

-- 6. Fixed Seed UUID occupancy. Any existing row must have the expected name before Seed is run.
select 'leads' as table_name, id, name
from public.leads
where id in (
  '40000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000002',
  '40000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000004',
  '40000000-0000-4000-8000-000000000005','40000000-0000-4000-8000-000000000006',
  '40000000-0000-4000-8000-000000000007','40000000-0000-4000-8000-000000000008'
);

-- 7. Existing business names that would conflict with the optional Seed.
select id, name, email
from public.leads
where name in ('Anan Chai','Pim Suda','Nok Kanya','Beam Viroj','Krit Som','Dao Mali','Mew Araya','Ton Niran')
order by name;

-- 7b. Optional V2-table Seed conflicts when those tables already exist from an earlier attempt.
-- NULL means the table does not exist yet. Otherwise the XML contains matching UUID/name rows for review.
select
  case when to_regclass('public.campaigns') is not null then query_to_xml(
    $$select id,name from public.campaigns where id='10000000-0000-4000-8000-000000000001' or name='Thailand Q4 Market Expansion'$$,
    false, true, ''
  ) end as campaign_seed_conflicts,
  case when to_regclass('public.partners') is not null then query_to_xml(
    $$select id,name from public.partners where id in ('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003') or name in ('Thailand PR Agency','Bangkok Distributor','Tech Media Partner')$$,
    false, true, ''
  ) end as partner_seed_conflicts,
  case when to_regclass('public.activities') is not null then query_to_xml(
    $$select id,name from public.activities where id in ('30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000003') or name in ('Techsauce Expo','Thailand Partner Webinar','Bangkok Dealer Demo')$$,
    false, true, ''
  ) end as activity_seed_conflicts,
  case when to_regclass('public.opportunities') is not null then query_to_xml(
    $$select id,name from public.opportunities where id in ('50000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002','50000000-0000-4000-8000-000000000003','50000000-0000-4000-8000-000000000004') or name in ('Siam Robotics Expansion','Eastern Manufacturing Rollout','Bangkok Components Pilot','CPS Platform Upgrade')$$,
    false, true, ''
  ) end as opportunity_seed_conflicts;

-- 8. Existing project-specific function, if any. A generic set_updated_at function is not modified.
select n.nspname as schema_name, p.proname as function_name, pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('marketops_set_updated_at','set_updated_at')
order by p.proname;
