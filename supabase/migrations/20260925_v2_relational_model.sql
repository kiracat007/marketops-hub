-- Non-destructive MarketOps Hub V1 -> V2 migration for an existing public.leads table.
-- THIS POLICY IS FOR DEMO PURPOSES ONLY.
-- DO NOT USE THIS POLICY FOR SENSITIVE PRODUCTION DATA.

begin;

-- Stop before making changes if the existing Leads table does not match the required baseline.
do $$
declare
  required_column text;
  leads_id_type text;
begin
  if to_regclass('public.leads') is null then
    raise exception 'Preflight failed: public.leads does not exist.';
  end if;

  foreach required_column in array array['id','name','email','status','source','potential_value','created_at'] loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'leads' and column_name = required_column
    ) then
      raise exception 'Preflight failed: public.leads.% is missing.', required_column;
    end if;
  end loop;

  select data_type into leads_id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'leads' and column_name = 'id';
  if leads_id_type <> 'uuid' then
    raise exception 'Preflight failed: public.leads.id must be uuid, found %.', leads_id_type;
  end if;
end $$;

create extension if not exists pgcrypto;

create or replace function public.marketops_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.campaigns (
  id uuid constraint pk_campaigns primary key default gen_random_uuid(),
  name text not null,
  description text,
  goal text,
  status text not null default 'Planning' constraint chk_campaigns_status check (status in ('Planning','Active','Completed','Paused')),
  owner text,
  channel text,
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0 constraint chk_campaigns_budget_nonnegative check (budget >= 0),
  spend numeric(14,2) not null default 0 constraint chk_campaigns_spend_nonnegative check (spend >= 0),
  target_leads integer not null default 0 constraint chk_campaigns_target_leads_nonnegative check (target_leads >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid constraint pk_partners primary key default gen_random_uuid(),
  name text not null,
  company text,
  type text not null constraint chk_partners_type check (type in ('KOL','Influencer','Agency','Dealer','Distributor','Vendor','Media','Other')),
  status text not null default 'Prospect' constraint chk_partners_status check (status in ('Active','Inactive','Prospect')),
  region text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid constraint pk_activities primary key default gen_random_uuid(),
  campaign_id uuid,
  partner_id uuid,
  name text not null,
  type text not null constraint chk_activities_type check (type in ('Webinar','Exhibition','Field Demo','Product Launch','Roadshow','Offline Promotion','Event','Other')),
  status text not null default 'Planning' constraint chk_activities_status check (status in ('Planning','Upcoming','In Progress','Completed','Cancelled')),
  owner text,
  start_date date,
  end_date date,
  budget numeric(14,2) not null default 0 constraint chk_activities_budget_nonnegative check (budget >= 0),
  spend numeric(14,2) not null default 0 constraint chk_activities_spend_nonnegative check (spend >= 0),
  target_leads integer not null default 0 constraint chk_activities_target_leads_nonnegative check (target_leads >= 0),
  attendees integer not null default 0 constraint chk_activities_attendees_nonnegative check (attendees >= 0),
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_activities_campaign foreign key (campaign_id) references public.campaigns(id) on delete set null,
  constraint fk_activities_partner foreign key (partner_id) references public.partners(id) on delete set null
);

create table if not exists public.opportunities (
  id uuid constraint pk_opportunities primary key default gen_random_uuid(),
  lead_id uuid,
  campaign_id uuid,
  name text not null,
  company text,
  stage text not null default 'Discovery' constraint chk_opportunities_stage check (stage in ('Discovery','Proposal','Negotiation','Won','Lost')),
  value numeric(14,2) not null default 0 constraint chk_opportunities_value_nonnegative check (value >= 0),
  owner text,
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_opportunities_lead foreign key (lead_id) references public.leads(id) on delete set null,
  constraint fk_opportunities_campaign foreign key (campaign_id) references public.campaigns(id) on delete set null
);

-- Add nullable relationship columns without touching existing Lead rows.
do $$
declare
  relation_column text;
  existing_type text;
begin
  foreach relation_column in array array['campaign_id','activity_id','partner_id'] loop
    select data_type into existing_type
    from information_schema.columns
    where table_schema = 'public' and table_name = 'leads' and column_name = relation_column;

    if existing_type is null then
      execute format('alter table public.leads add column %I uuid null', relation_column);
    elsif existing_type <> 'uuid' then
      raise exception 'Migration stopped: public.leads.% must be uuid, found %.', relation_column, existing_type;
    end if;
  end loop;
end $$;

-- Add or validate the three explicitly named Lead foreign keys.
do $$
declare
  relation record;
  existing_constraint record;
  local_attnum smallint;
begin
  for relation in
    select * from (values
      ('fk_leads_campaign','campaign_id','campaigns'),
      ('fk_leads_activity','activity_id','activities'),
      ('fk_leads_partner','partner_id','partners')
    ) as expected(constraint_name, column_name, target_table)
  loop
    select attnum into local_attnum
    from pg_attribute
    where attrelid = 'public.leads'::regclass and attname = relation.column_name and not attisdropped;

    select contype, confrelid, confdeltype, conkey
      into existing_constraint
    from pg_constraint
    where conrelid = 'public.leads'::regclass and conname = relation.constraint_name;

    if found then
      if existing_constraint.contype <> 'f'
         or existing_constraint.confrelid <> to_regclass(format('public.%I', relation.target_table))
         or existing_constraint.confdeltype <> 'n'
         or existing_constraint.conkey <> array[local_attnum]::smallint[] then
        raise exception 'Migration stopped: constraint % exists but does not match the expected foreign key.', relation.constraint_name;
      end if;
    else
      execute format(
        'alter table public.leads add constraint %I foreign key (%I) references public.%I(id) on delete set null',
        relation.constraint_name, relation.column_name, relation.target_table
      );
    end if;
  end loop;
end $$;

create index if not exists idx_marketops_activities_campaign_id on public.activities(campaign_id);
create index if not exists idx_marketops_activities_partner_id on public.activities(partner_id);
create index if not exists idx_marketops_leads_campaign_id on public.leads(campaign_id);
create index if not exists idx_marketops_leads_activity_id on public.leads(activity_id);
create index if not exists idx_marketops_leads_partner_id on public.leads(partner_id);
create index if not exists idx_marketops_opportunities_campaign_id on public.opportunities(campaign_id);
create index if not exists idx_marketops_opportunities_lead_id on public.opportunities(lead_id);

drop trigger if exists marketops_campaigns_set_updated_at on public.campaigns;
create trigger marketops_campaigns_set_updated_at before update on public.campaigns for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_partners_set_updated_at on public.partners;
create trigger marketops_partners_set_updated_at before update on public.partners for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_activities_set_updated_at on public.activities;
create trigger marketops_activities_set_updated_at before update on public.activities for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_opportunities_set_updated_at on public.opportunities;
create trigger marketops_opportunities_set_updated_at before update on public.opportunities for each row execute function public.marketops_set_updated_at();

alter table public.campaigns enable row level security;
alter table public.partners enable row level security;
alter table public.activities enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;

-- Only this project's specifically named policy is replaced. Unknown or legacy policies are untouched.
do $$
declare table_name text;
begin
  foreach table_name in array array['campaigns','partners','activities','leads','opportunities'] loop
    execute format('drop policy if exists marketops_demo_anon_access on public.%I', table_name);
    execute format('create policy marketops_demo_anon_access on public.%I for all to anon using (true) with check (true)', table_name);
    execute format('comment on policy marketops_demo_anon_access on public.%I is %L', table_name,
      'THIS POLICY IS FOR DEMO PURPOSES ONLY. DO NOT USE THIS POLICY FOR SENSITIVE PRODUCTION DATA.');
  end loop;
end $$;

-- Normalize only the two frontend roles. service_role, postgres, and all other roles are untouched.
revoke all privileges on table public.campaigns, public.partners, public.activities, public.leads, public.opportunities from anon;
revoke all privileges on table public.campaigns, public.partners, public.activities, public.leads, public.opportunities from authenticated;

grant usage on schema public to anon;
grant select, insert, update, delete on table public.campaigns, public.partners, public.activities, public.leads, public.opportunities to anon;

commit;
