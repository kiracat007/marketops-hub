-- Demo Lead records matching the public MarketOps Hub dataset.
-- This script is repeatable: existing rows with the same UUID are updated.
-- Run supabase/schema.sql before this file in a new Supabase project.

insert into public.leads (
  id, name, company, email, phone, source, campaign, activity, partner,
  status, potential_value, owner, created_at
)
values
  ('8d084a3b-5dc4-48b0-a240-2b87c1a090cc', 'Noah Smith', 'Cloudline AU', 'noah@example.com', '+61 2 8123 6670', 'Partner', '客户成功案例推广', '客户案例圆桌交流', 'BrightPath Consulting', 'Lost', 120000, '杨帆', '2026-07-23T12:00:00+00:00'),
  ('42d12ba6-4159-4e65-a5fd-d71c2cf3290f', '周海峰', '恒峰制造', 'haifeng@example.com', '+86 139 2200 3020', 'Field Demo', '渠道伙伴增长计划', '智能制造现场演示', '华东渠道联盟', 'Won', 760000, '王明', '2026-08-18T12:00:00+00:00'),
  ('9602eb39-7671-4c9d-bee1-b882ba9b4165', 'Akira Mori', 'Sakura Industrial', 'akira@example.com', '+81 3 5511 8842', 'Partner', '亚太市场认知提升', '东京行业媒体交流会', 'Peak AV Solutions', 'Qualified', 340000, '叶宁', '2026-08-26T12:00:00+00:00'),
  ('711b8815-1f10-4ff7-b4b3-72ed93d6ea9e', 'Grace Tan', 'Vertex Systems', 'grace@example.com', '+65 6123 2010', 'Event', '2026 Q4 品牌声量计划', '品牌合作伙伴峰会', 'Northstar Creative', 'Opportunity', 520000, '林悦', '2026-08-29T12:00:00+00:00'),
  ('44ee70ba-49fd-4161-aa49-d8195df6f92f', '郑宇', '万川物流', 'yu.zheng@example.com', '+86 138 7200 4432', 'Other', '年度客户体验巡展', '华南客户体验 Roadshow', '未来制造社群', 'Qualified', 310000, '韩雪', '2026-08-30T12:00:00+00:00'),
  ('6bb7ba19-82d5-4f7b-b813-9d910db31fb0', '王楚', '启明医疗', 'chu.wang@example.com', '+86 135 6000 9921', 'Campaign', '2026 Q4 品牌声量计划', '未关联', '未关联', 'Contacted', 260000, '林悦', '2026-08-31T12:00:00+00:00'),
  ('e71a8c49-30d7-4d31-8c62-3a1b1a39e186', 'Aisha Lim', 'Nexa Commerce', 'aisha.lim@example.com', '+60 3 2244 7801', 'Webinar', '行业解决方案 Webinar', '企业增长战略 Webinar', '商业增长周刊', 'New', 98000, '赵欣', '2026-09-01T12:00:00+00:00'),
  ('6b975133-ffda-41d4-ab47-a721f1a9dab1', 'Emily Wong', 'Aurora Retail', 'emily@example.com', '+852 2988 3201', 'Campaign', '新品 Nova 发布 Campaign', 'Nova 产品发布会', 'Northstar Creative', 'Contacted', 190000, '陈森', '2026-09-01T12:00:00+00:00'),
  ('f8418903-0fd8-4902-89a6-c578212f460b', 'Daniel Koh', 'Orbit Analytics', 'daniel.koh@example.com', '+65 6234 9081', 'Organic', '未关联', '未关联', '未关联', 'New', 145000, '林悦', '2026-09-02T12:00:00+00:00'),
  ('f20a908b-a544-478b-81a1-7cde41a858d3', '高源', '新域数据', 'yuan.gao@example.com', '+86 136 3000 2188', 'Organic', '未关联', '未关联', '未关联', 'New', 85000, '周岚', '2026-09-02T12:00:00+00:00'),
  ('a8a8a225-c366-4908-861b-5f7de75c063c', '孙曼', '蓝图软件', 'man.sun@example.com', '+86 137 4400 6712', 'Event', '企业决策者内容推广', '园区线下产品体验日', '科技观察局', 'Opportunity', 430000, '周岚', '2026-09-10T12:00:00+00:00'),
  ('abdc3627-085b-48d0-b140-c0e35907a7bc', '刘晨', '远航智能科技', 'chen.liu@example.com', '+86 138 1100 1001', 'Webinar', '行业解决方案 Webinar', '企业增长战略 Webinar', '商业增长周刊', 'Qualified', 280000, '赵欣', '2026-09-28T12:00:00+00:00')
on conflict (id) do update set
  name = excluded.name,
  company = excluded.company,
  email = excluded.email,
  phone = excluded.phone,
  source = excluded.source,
  campaign = excluded.campaign,
  activity = excluded.activity,
  partner = excluded.partner,
  status = excluded.status,
  potential_value = excluded.potential_value,
  owner = excluded.owner,
  created_at = excluded.created_at;
