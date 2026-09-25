-- Read-only verification for MarketOps Hub V3.

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'leads'
  and column_name in ('last_contacted_at','next_follow_up_at','follow_up_status','notes')
order by ordinal_position;

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'tasks'
order by ordinal_position;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in ('public.leads'::regclass, 'public.tasks'::regclass)
  and conname in (
    'chk_leads_follow_up_status','chk_tasks_type','chk_tasks_status','chk_tasks_priority',
    'fk_tasks_lead','fk_tasks_opportunity','fk_tasks_campaign','fk_tasks_activity'
  )
order by conname;

select
  required.index_name,
  indexes.indexname is not null as index_exists,
  indexes.indexdef
from (
  values
    ('idx_marketops_tasks_due_at'),
    ('idx_marketops_tasks_lead_id'),
    ('idx_marketops_tasks_opportunity_id'),
    ('idx_marketops_tasks_campaign_id'),
    ('idx_marketops_tasks_activity_id')
) as required(index_name)
left join pg_indexes as indexes
  on indexes.schemaname = 'public'
 and indexes.tablename = 'tasks'
 and indexes.indexname = required.index_name
order by required.index_name;

select
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'tasks'
  and trigger_name = 'marketops_tasks_set_updated_at';

select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename = 'tasks';

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'tasks';

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'tasks'
  and grantee in ('anon','authenticated')
order by grantee, privilege_type;

select
  has_table_privilege('anon','public.tasks','SELECT') as anon_select,
  has_table_privilege('anon','public.tasks','INSERT') as anon_insert,
  has_table_privilege('anon','public.tasks','UPDATE') as anon_update,
  has_table_privilege('anon','public.tasks','DELETE') as anon_delete,
  has_table_privilege('anon','public.tasks','TRUNCATE') as anon_truncate,
  has_table_privilege('anon','public.tasks','REFERENCES') as anon_references,
  has_table_privilege('anon','public.tasks','TRIGGER') as anon_trigger,
  (
    has_table_privilege('authenticated','public.tasks','SELECT') or
    has_table_privilege('authenticated','public.tasks','INSERT') or
    has_table_privilege('authenticated','public.tasks','UPDATE') or
    has_table_privilege('authenticated','public.tasks','DELETE') or
    has_table_privilege('authenticated','public.tasks','TRUNCATE') or
    has_table_privilege('authenticated','public.tasks','REFERENCES') or
    has_table_privilege('authenticated','public.tasks','TRIGGER')
  ) as authenticated_any_direct_privilege;

select
  (select count(*) from public.leads) as leads_row_count,
  (select count(*) from public.tasks) as tasks_row_count;

select 'lead_id' as foreign_key, count(*) as orphan_count
from public.tasks as task
left join public.leads as lead on lead.id = task.lead_id
where task.lead_id is not null and lead.id is null
union all
select 'opportunity_id', count(*)
from public.tasks as task
left join public.opportunities as opportunity on opportunity.id = task.opportunity_id
where task.opportunity_id is not null and opportunity.id is null
union all
select 'campaign_id', count(*)
from public.tasks as task
left join public.campaigns as campaign on campaign.id = task.campaign_id
where task.campaign_id is not null and campaign.id is null
union all
select 'activity_id', count(*)
from public.tasks as task
left join public.activities as activity on activity.id = task.activity_id
where task.activity_id is not null and activity.id is null
order by foreign_key;

select 'leads.follow_up_status' as field, count(*) as invalid_count
from public.leads
where follow_up_status is not null
  and follow_up_status not in ('Not Started','In Progress','Waiting','Completed')
union all
select 'tasks.type', count(*)
from public.tasks
where type not in ('Follow-up','Call','Email','Meeting','Preparation','Other')
union all
select 'tasks.status', count(*)
from public.tasks
where status not in ('Open','In Progress','Completed','Cancelled')
union all
select 'tasks.priority', count(*)
from public.tasks
where priority not in ('Low','Medium','High')
order by field;
