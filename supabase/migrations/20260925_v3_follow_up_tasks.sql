-- MarketOps Hub V3: lead follow-up fields and operational tasks.
-- Non-destructive migration for an existing V2 public demo database.

begin;

do $$
declare
  missing_relation text;
begin
  select required.relation_name
    into missing_relation
  from (
    values
      ('public.leads'),
      ('public.campaigns'),
      ('public.activities'),
      ('public.opportunities')
  ) as required(relation_name)
  where to_regclass(required.relation_name) is null
  limit 1;

  if missing_relation is not null then
    raise exception 'Required relation % does not exist; V3 migration aborted.', missing_relation;
  end if;

  if to_regprocedure('public.marketops_set_updated_at()') is null then
    raise exception 'Required function public.marketops_set_updated_at() does not exist; V3 migration aborted.';
  end if;
end $$;

do $$
declare
  field record;
  actual_type oid;
begin
  for field in
    select *
    from (
      values
        ('last_contacted_at', 'timestamptz'::regtype),
        ('next_follow_up_at', 'timestamptz'::regtype),
        ('follow_up_status', 'text'::regtype),
        ('notes', 'text'::regtype)
    ) as expected(column_name, expected_type)
  loop
    select attribute.atttypid
      into actual_type
    from pg_attribute as attribute
    where attribute.attrelid = 'public.leads'::regclass
      and attribute.attname = field.column_name
      and attribute.attnum > 0
      and not attribute.attisdropped;

    if actual_type is not null and actual_type <> field.expected_type then
      raise exception 'public.leads.% has type %, expected %; V3 migration aborted.',
        field.column_name,
        format_type(actual_type, null),
        format_type(field.expected_type, null);
    end if;
  end loop;
end $$;

do $$
declare
  field record;
  required_constraint record;
  actual_type oid;
  tasks_relation regclass := to_regclass('public.tasks');
begin
  if tasks_relation is not null then
    for field in
      select *
      from (
        values
          ('id', 'uuid'::regtype),
          ('title', 'text'::regtype),
          ('description', 'text'::regtype),
          ('type', 'text'::regtype),
          ('status', 'text'::regtype),
          ('priority', 'text'::regtype),
          ('owner', 'text'::regtype),
          ('due_at', 'timestamptz'::regtype),
          ('lead_id', 'uuid'::regtype),
          ('opportunity_id', 'uuid'::regtype),
          ('campaign_id', 'uuid'::regtype),
          ('activity_id', 'uuid'::regtype),
          ('created_at', 'timestamptz'::regtype),
          ('updated_at', 'timestamptz'::regtype),
          ('completed_at', 'timestamptz'::regtype)
      ) as expected(column_name, expected_type)
    loop
      select attribute.atttypid
        into actual_type
      from pg_attribute as attribute
      where attribute.attrelid = tasks_relation
        and attribute.attname = field.column_name
        and attribute.attnum > 0
        and not attribute.attisdropped;

      if actual_type is null then
        raise exception 'Existing public.tasks is missing required column %; V3 migration aborted.',
          field.column_name;
      elsif actual_type <> field.expected_type then
        raise exception 'public.tasks.% has type %, expected %; V3 migration aborted.',
          field.column_name,
          format_type(actual_type, null),
          format_type(field.expected_type, null);
      end if;
    end loop;

    if not exists (
      select 1
      from pg_constraint
      where conrelid = tasks_relation
        and contype = 'p'
        and conkey = array[
          (
            select attnum
            from pg_attribute
            where attrelid = tasks_relation
              and attname = 'id'
              and not attisdropped
          )::smallint
        ]
    ) then
      raise exception 'Existing public.tasks.id is not the primary key; V3 migration aborted.';
    end if;

    for required_constraint in
      select *
      from (
        values
          ('chk_tasks_type', 'c'),
          ('chk_tasks_status', 'c'),
          ('chk_tasks_priority', 'c'),
          ('fk_tasks_lead', 'f'),
          ('fk_tasks_opportunity', 'f'),
          ('fk_tasks_campaign', 'f'),
          ('fk_tasks_activity', 'f')
      ) as expected(constraint_name, constraint_type)
    loop
      if not exists (
        select 1
        from pg_constraint
        where conrelid = tasks_relation
          and conname = required_constraint.constraint_name
          and contype = required_constraint.constraint_type::"char"
      ) then
        raise exception 'Existing public.tasks is missing or has an incompatible constraint %; V3 migration aborted.',
          required_constraint.constraint_name;
      end if;
    end loop;
  end if;
end $$;

alter table public.leads
  add column if not exists last_contacted_at timestamptz,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists follow_up_status text,
  add column if not exists notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'chk_leads_follow_up_status'
      and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads
      add constraint chk_leads_follow_up_status
      check (follow_up_status is null or follow_up_status in ('Not Started','In Progress','Waiting','Completed'));
  end if;
end $$;

create table if not exists public.tasks (
  id uuid constraint pk_tasks primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null constraint chk_tasks_type check (type in ('Follow-up','Call','Email','Meeting','Preparation','Other')),
  status text not null default 'Open' constraint chk_tasks_status check (status in ('Open','In Progress','Completed','Cancelled')),
  priority text not null default 'Medium' constraint chk_tasks_priority check (priority in ('Low','Medium','High')),
  owner text,
  due_at timestamptz,
  lead_id uuid,
  opportunity_id uuid,
  campaign_id uuid,
  activity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint fk_tasks_lead foreign key (lead_id) references public.leads(id) on delete set null,
  constraint fk_tasks_opportunity foreign key (opportunity_id) references public.opportunities(id) on delete set null,
  constraint fk_tasks_campaign foreign key (campaign_id) references public.campaigns(id) on delete set null,
  constraint fk_tasks_activity foreign key (activity_id) references public.activities(id) on delete set null
);

create index if not exists idx_marketops_tasks_due_at on public.tasks(due_at);
create index if not exists idx_marketops_tasks_lead_id on public.tasks(lead_id);
create index if not exists idx_marketops_tasks_opportunity_id on public.tasks(opportunity_id);
create index if not exists idx_marketops_tasks_campaign_id on public.tasks(campaign_id);
create index if not exists idx_marketops_tasks_activity_id on public.tasks(activity_id);

drop trigger if exists marketops_tasks_set_updated_at on public.tasks;
create trigger marketops_tasks_set_updated_at
before update on public.tasks
for each row execute function public.marketops_set_updated_at();

alter table public.tasks enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks'
      and policyname = 'marketops_demo_anon_access'
  ) then
    create policy marketops_demo_anon_access
      on public.tasks for all to anon
      using (true) with check (true);
  end if;
end $$;

revoke all privileges on table public.tasks from anon;
revoke all privileges on table public.tasks from authenticated;
grant select, insert, update, delete on table public.tasks to anon;

commit;
