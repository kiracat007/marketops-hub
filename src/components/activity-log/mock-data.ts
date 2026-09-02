import type { ActivityLogEntry } from "./types";

export const initialActivityLogs: ActivityLogEntry[] = [
  { id: 1, action: "Lead 状态更新", module: "Lead", description: "Lead “高源”从 New 更新为 Contacted", user: "周岚", timestamp: "2026-09-02T16:42:00+08:00", type: "Status Changed" },
  { id: 2, action: "Campaign 已更新", module: "Campaign", description: "Campaign “亚太市场认知提升”的预算和结束日期已更新", user: "叶宁", timestamp: "2026-09-02T15:18:00+08:00", type: "Updated" },
  { id: 3, action: "Lead 已创建", module: "Lead", description: "创建 Lead “Daniel Koh”，来源为 Organic", user: "林悦", timestamp: "2026-09-02T14:05:00+08:00", type: "Created" },
  { id: 4, action: "Activity 状态更新", module: "Activity", description: "Activity “Nova 产品发布会”从 Planning 更新为 Confirmed", user: "陈森", timestamp: "2026-09-02T11:36:00+08:00", type: "Status Changed" },
  { id: 5, action: "Partner 已更新", module: "Partner", description: "Partner “Northstar Creative”的联系人信息已更新", user: "林悦", timestamp: "2026-09-01T17:24:00+08:00", type: "Updated" },
  { id: 6, action: "Lead 已创建", module: "Lead", description: "创建 Lead “Emily Wong”，关联新品 Nova 发布 Campaign", user: "陈森", timestamp: "2026-09-01T13:48:00+08:00", type: "Created" },
  { id: 7, action: "Activity 已创建", module: "Activity", description: "创建 Activity “东京行业媒体交流会”", user: "叶宁", timestamp: "2026-08-31T16:12:00+08:00", type: "Created" },
  { id: 8, action: "Campaign 状态更新", module: "Campaign", description: "Campaign “渠道伙伴增长计划”从 Active 更新为 Completed", user: "王明", timestamp: "2026-08-31T10:20:00+08:00", type: "Status Changed" },
  { id: 9, action: "Partner 已创建", module: "Partner", description: "创建 Partner “ExpoCraft”，类型为 Vendor", user: "陈森", timestamp: "2026-08-30T15:55:00+08:00", type: "Created" },
  { id: 10, action: "Lead 状态更新", module: "Lead", description: "Lead “Grace Tan”从 Qualified 更新为 Opportunity", user: "林悦", timestamp: "2026-08-29T18:08:00+08:00", type: "Status Changed" },
  { id: 11, action: "Activity 已更新", module: "Activity", description: "Activity “品牌合作伙伴峰会”的地点已更新为 Marina Bay", user: "林悦", timestamp: "2026-08-28T09:32:00+08:00", type: "Updated" },
  { id: 12, action: "Partner 状态更新", module: "Partner", description: "Partner “商业增长周刊”从 Contacted 更新为 Active", user: "赵欣", timestamp: "2026-08-27T14:16:00+08:00", type: "Status Changed" },
  { id: 13, action: "Campaign 已创建", module: "Campaign", description: "创建 Campaign “年度客户体验巡展”", user: "韩雪", timestamp: "2026-08-26T11:45:00+08:00", type: "Created" },
  { id: 14, action: "Lead 已删除", module: "Lead", description: "删除重复 Lead “Alex Chen”", user: "周岚", timestamp: "2026-08-25T16:30:00+08:00", type: "Deleted" },
  { id: 15, action: "Activity 已删除", module: "Activity", description: "删除已取消的 Activity “华东渠道闭门会”", user: "王明", timestamp: "2026-08-24T10:05:00+08:00", type: "Deleted" },
  { id: 16, action: "Partner 已删除", module: "Partner", description: "删除重复 Partner “Legacy Media Group”", user: "叶宁", timestamp: "2026-08-22T17:40:00+08:00", type: "Deleted" },
];
