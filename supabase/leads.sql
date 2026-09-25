-- LEGACY V1 ONLY: single-table Leads setup retained for historical reference.
-- New V2 environments must run schema.sql and then seed.sql instead.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  email text,
  phone text not null default '',
  source text not null,
  campaign text not null default '未关联',
  activity text not null default '未关联',
  partner text not null default '未关联',
  status text not null default 'New',
  potential_value numeric(14, 2) not null default 0,
  owner text not null default '',
  created_at timestamptz not null default now(),

  constraint leads_name_not_blank check (length(trim(name)) > 0),
  constraint leads_source_check check (
    source in ('Campaign', 'Event', 'Field Demo', 'Webinar', 'Partner', 'Organic', 'Other')
  ),
  constraint leads_status_check check (
    status in ('New', 'Contacted', 'Qualified', 'Opportunity', 'Won', 'Lost')
  ),
  constraint leads_potential_value_non_negative check (potential_value >= 0)
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);
create index leads_source_idx on public.leads (source);

-- RLS is required because the browser uses a public publishable key.
alter table public.leads enable row level security;

-- Minimal policies for the current public demo: anonymous visitors can read
-- and insert leads, but cannot update or delete them through the public client.
create policy "Public demo can read leads"
on public.leads
for select
to anon, authenticated
using (true);

create policy "Public demo can insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);

insert into public.leads (
  name,
  company,
  email,
  phone,
  source,
  campaign,
  activity,
  partner,
  status,
  potential_value,
  owner,
  created_at
)
values
  ('刘晨', '远航智能科技', 'chen.liu@example.com', '+86 138 1100 1001', 'Webinar', '行业解决方案 Webinar', '企业增长战略 Webinar', '商业增长周刊', 'Qualified', 280000, '赵欣', '2026-09-28 12:00:00+00'),
  ('Grace Tan', 'Vertex Systems', 'grace@example.com', '+65 6123 2010', 'Event', '2026 Q4 品牌声量计划', '品牌合作伙伴峰会', 'Northstar Creative', 'Opportunity', 520000, '林悦', '2026-08-29 12:00:00+00'),
  ('周海峰', '恒峰制造', 'haifeng@example.com', '+86 139 2200 3020', 'Field Demo', '渠道伙伴增长计划', '智能制造现场演示', '华东渠道联盟', 'Won', 760000, '王明', '2026-08-18 12:00:00+00'),
  ('Emily Wong', 'Aurora Retail', 'emily@example.com', '+852 2988 3201', 'Campaign', '新品 Nova 发布 Campaign', 'Nova 产品发布会', 'Northstar Creative', 'Contacted', 190000, '陈森', '2026-09-01 12:00:00+00'),
  ('高源', '新域数据', 'yuan.gao@example.com', '+86 136 3000 2188', 'Organic', '未关联', '未关联', '未关联', 'New', 85000, '周岚', '2026-09-02 12:00:00+00'),
  ('Akira Mori', 'Sakura Industrial', 'akira@example.com', '+81 3 5511 8842', 'Partner', '亚太市场认知提升', '东京行业媒体交流会', 'Peak AV Solutions', 'Qualified', 340000, '叶宁', '2026-08-26 12:00:00+00'),
  ('孙曼', '蓝图软件', 'man.sun@example.com', '+86 137 4400 6712', 'Event', '企业决策者内容推广', '园区线下产品体验日', '科技观察局', 'Opportunity', 430000, '周岚', '2026-09-10 12:00:00+00'),
  ('Noah Smith', 'Cloudline AU', 'noah@example.com', '+61 2 8123 6670', 'Partner', '客户成功案例推广', '客户案例圆桌交流', 'BrightPath Consulting', 'Lost', 120000, '杨帆', '2026-07-23 12:00:00+00'),
  ('王楚', '启明医疗', 'chu.wang@example.com', '+86 135 6000 9921', 'Campaign', '2026 Q4 品牌声量计划', '未关联', '未关联', 'Contacted', 260000, '林悦', '2026-08-31 12:00:00+00'),
  ('Aisha Lim', 'Nexa Commerce', 'aisha.lim@example.com', '+60 3 2244 7801', 'Webinar', '行业解决方案 Webinar', '企业增长战略 Webinar', '商业增长周刊', 'New', 98000, '赵欣', '2026-09-01 12:00:00+00'),
  ('郑宇', '万川物流', 'yu.zheng@example.com', '+86 138 7200 4432', 'Other', '年度客户体验巡展', '华南客户体验 Roadshow', '未来制造社群', 'Qualified', 310000, '韩雪', '2026-08-30 12:00:00+00'),
  ('Daniel Koh', 'Orbit Analytics', 'daniel.koh@example.com', '+65 6234 9081', 'Organic', '未关联', '未关联', '未关联', 'New', 145000, '林悦', '2026-09-02 12:00:00+00');
