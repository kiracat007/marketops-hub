import type { Campaign } from "./types";

export const initialCampaigns: Campaign[] = [
  { id: 1, name: "2026 Q4 品牌声量计划", channel: "LinkedIn", owner: "林悦", budget: 180000, startDate: "2026-09-15", endDate: "2026-12-15", status: "Active", targetLeads: 850, actualLeads: 326 },
  { id: 2, name: "新品 Nova 发布 Campaign", channel: "Event", owner: "陈森", budget: 320000, startDate: "2026-10-08", endDate: "2026-11-30", status: "Planning", targetLeads: 1200, actualLeads: 0 },
  { id: 3, name: "企业决策者内容推广", channel: "LinkedIn", owner: "周岚", budget: 95000, startDate: "2026-08-01", endDate: "2026-10-31", status: "Active", targetLeads: 520, actualLeads: 287 },
  { id: 4, name: "渠道伙伴增长计划", channel: "Offline", owner: "王明", budget: 150000, startDate: "2026-07-10", endDate: "2026-09-20", status: "Completed", targetLeads: 600, actualLeads: 648 },
  { id: 5, name: "行业解决方案 Webinar", channel: "Webinar", owner: "赵欣", budget: 68000, startDate: "2026-09-22", endDate: "2026-10-22", status: "Planning", targetLeads: 400, actualLeads: 0 },
  { id: 6, name: "客户成功案例推广", channel: "Facebook", owner: "杨帆", budget: 72000, startDate: "2026-06-01", endDate: "2026-08-31", status: "Completed", targetLeads: 300, actualLeads: 342 },
  { id: 7, name: "亚太市场认知提升", channel: "Instagram", owner: "叶宁", budget: 210000, startDate: "2026-09-01", endDate: "2026-12-20", status: "Active", targetLeads: 900, actualLeads: 194 },
  { id: 8, name: "年度客户体验巡展", channel: "Event", owner: "韩雪", budget: 460000, startDate: "2026-11-05", endDate: "2027-01-18", status: "Planning", targetLeads: 1500, actualLeads: 0 },
];
