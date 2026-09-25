-- Read-only preflight for MarketOps Hub V3.
-- This file intentionally contains SELECT statements only.

select
  to_regclass('public.leads') is not null as leads_exists,
  to_regclass('public.tasks') is not null as tasks_exists;

select
  required.column_name,
  columns.data_type,
  columns.udt_name,
  columns.is_nullable,
  columns.column_name is not null as column_exists
from (
  values
    ('last_contacted_at'),
    ('next_follow_up_at'),
    ('follow_up_status'),
    ('notes')
) as required(column_name)
left join information_schema.columns as columns
  on columns.table_schema = 'public'
 and columns.table_name = 'leads'
 and columns.column_name = required.column_name
order by required.column_name;

select
  to_regprocedure('public.marketops_set_updated_at()') is not null
    as marketops_set_updated_at_exists;

select
  required.table_name,
  to_regclass(format('public.%I', required.table_name)) is not null as table_exists
from (
  values
    ('campaigns'),
    ('partners'),
    ('activities'),
    ('opportunities'),
    ('leads')
) as required(table_name)
order by required.table_name;

select count(*) as leads_row_count
from public.leads;

select
  exists (
    select 1
    from pg_constraint
    where conrelid = to_regclass('public.leads')
      and conname = 'chk_leads_follow_up_status'
  ) as chk_leads_follow_up_status_exists;

-- These catalog queries return no rows when public.tasks does not yet exist.
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tasks'
order by ordinal_position;

select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = to_regclass('public.tasks')
order by conname;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'tasks'
order by policyname;

select grantee, privilege_type, is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'tasks'
order by grantee, privilege_type;
