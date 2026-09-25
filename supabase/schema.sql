-- MarketOps Hub V2 target schema reference for a NEW project.
-- Do not use this file to upgrade an existing V1 project.
-- Existing V1 projects must use migrations/20260925_v2_relational_model.sql.
-- THIS POLICY IS FOR DEMO PURPOSES ONLY.
-- DO NOT USE THIS POLICY FOR SENSITIVE PRODUCTION DATA.

begin;

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

create table if not exists public.leads (
  id uuid constraint pk_leads primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text not null constraint chk_leads_source check (source in ('Campaign','Event','Field Demo','Webinar','Partner','Organic','Other')),
  campaign text,
  activity text,
  partner text,
  campaign_id uuid,
  activity_id uuid,
  partner_id uuid,
  status text not null default 'New' constraint chk_leads_status check (status in ('New','Contacted','Qualified','Opportunity','Won','Lost')),
  potential_value numeric(14,2) not null default 0 constraint chk_leads_potential_value_nonnegative check (potential_value >= 0),
  owner text,
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  follow_up_status text constraint chk_leads_follow_up_status check (follow_up_status is null or follow_up_status in ('Not Started','In Progress','Waiting','Completed')),
  notes text,
  created_at timestamptz not null default now(),
  constraint fk_leads_campaign foreign key (campaign_id) references public.campaigns(id) on delete set null,
  constraint fk_leads_activity foreign key (activity_id) references public.activities(id) on delete set null,
  constraint fk_leads_partner foreign key (partner_id) references public.partners(id) on delete set null
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

create index if not exists idx_marketops_activities_campaign_id on public.activities(campaign_id);
create index if not exists idx_marketops_activities_partner_id on public.activities(partner_id);
create index if not exists idx_marketops_leads_campaign_id on public.leads(campaign_id);
create index if not exists idx_marketops_leads_activity_id on public.leads(activity_id);
create index if not exists idx_marketops_leads_partner_id on public.leads(partner_id);
create index if not exists idx_marketops_opportunities_campaign_id on public.opportunities(campaign_id);
create index if not exists idx_marketops_opportunities_lead_id on public.opportunities(lead_id);
create index if not exists idx_marketops_tasks_due_at on public.tasks(due_at);
create index if not exists idx_marketops_tasks_lead_id on public.tasks(lead_id);
create index if not exists idx_marketops_tasks_opportunity_id on public.tasks(opportunity_id);
create index if not exists idx_marketops_tasks_campaign_id on public.tasks(campaign_id);
create index if not exists idx_marketops_tasks_activity_id on public.tasks(activity_id);

drop trigger if exists marketops_campaigns_set_updated_at on public.campaigns;
create trigger marketops_campaigns_set_updated_at before update on public.campaigns for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_partners_set_updated_at on public.partners;
create trigger marketops_partners_set_updated_at before update on public.partners for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_activities_set_updated_at on public.activities;
create trigger marketops_activities_set_updated_at before update on public.activities for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_opportunities_set_updated_at on public.opportunities;
create trigger marketops_opportunities_set_updated_at before update on public.opportunities for each row execute function public.marketops_set_updated_at();
drop trigger if exists marketops_tasks_set_updated_at on public.tasks;
create trigger marketops_tasks_set_updated_at before update on public.tasks for each row execute function public.marketops_set_updated_at();

alter table public.campaigns enable row level security;
alter table public.partners enable row level security;
alter table public.activities enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.tasks enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['campaigns','partners','activities','leads','opportunities','tasks'] loop
    execute format('drop policy if exists marketops_demo_anon_access on public.%I', table_name);
    execute format('create policy marketops_demo_anon_access on public.%I for all to anon using (true) with check (true)', table_name);
    execute format('comment on policy marketops_demo_anon_access on public.%I is %L', table_name,
      'THIS POLICY IS FOR DEMO PURPOSES ONLY. DO NOT USE THIS POLICY FOR SENSITIVE PRODUCTION DATA.');
  end loop;
end $$;

-- Normalize only the two frontend roles. service_role, postgres, and all other roles are untouched.
revoke all privileges on table public.campaigns, public.partners, public.activities, public.leads, public.opportunities, public.tasks from anon;
revoke all privileges on table public.campaigns, public.partners, public.activities, public.leads, public.opportunities, public.tasks from authenticated;

grant usage on schema public to anon;
grant select, insert, update, delete on table public.campaigns, public.partners, public.activities, public.leads, public.opportunities, public.tasks to anon;

commit;
