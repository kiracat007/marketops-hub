-- This schema is intended for the public demo environment.
-- Anonymous write access is intentionally enabled for demonstration purposes
-- and is NOT recommended for production use.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text not null,
  campaign text,
  activity text,
  partner text,
  status text not null,
  potential_value numeric not null default 0,
  owner text,
  created_at timestamptz not null default now(),
  constraint leads_source_check check (
    source in ('Campaign', 'Event', 'Field Demo', 'Webinar', 'Partner', 'Organic', 'Other')
  ),
  constraint leads_status_check check (
    status in ('New', 'Contacted', 'Qualified', 'Opportunity', 'Won', 'Lost')
  ),
  constraint leads_potential_value_check check (potential_value >= 0)
);

alter table public.leads enable row level security;

drop policy if exists "Demo anonymous lead reads" on public.leads;
create policy "Demo anonymous lead reads"
  on public.leads for select
  to anon
  using (true);

drop policy if exists "Demo anonymous lead inserts" on public.leads;
create policy "Demo anonymous lead inserts"
  on public.leads for insert
  to anon
  with check (true);

drop policy if exists "Demo anonymous lead updates" on public.leads;
create policy "Demo anonymous lead updates"
  on public.leads for update
  to anon
  using (true)
  with check (true);

drop policy if exists "Demo anonymous lead deletes" on public.leads;
create policy "Demo anonymous lead deletes"
  on public.leads for delete
  to anon
  using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.leads to anon, authenticated;
