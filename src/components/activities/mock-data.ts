import type { Activity } from "./types";

export const initialActivities: Activity[] = [
  { id: 1, name: "企业增长战略 Webinar", type: "Webinar", campaign: "行业解决方案 Webinar", partner: "商业增长周刊", owner: "赵欣", location: "线上 · Zoom", startDate: "2026-09-28", endDate: "2026-09-28", status: "Upcoming", expectedAttendees: 280, actualAttendees: 0, budget: 36000 },
  { id: 2, name: "亚洲科技创新展", type: "Exhibition", campaign: "新品 Nova 发布 Campaign", partner: "ExpoCraft", owner: "陈森", location: "中国香港 · 会展中心", startDate: "2026-10-12", endDate: "2026-10-15", status: "Planning", expectedAttendees: 1200, actualAttendees: 0, budget: 280000 },
  { id: 3, name: "智能制造现场演示", type: "Field Demo", campaign: "渠道伙伴增长计划", partner: "华东渠道联盟", owner: "王明", location: "苏州 · 客户工厂", startDate: "2026-08-18", endDate: "2026-08-18", status: "Completed", expectedAttendees: 80, actualAttendees: 94, budget: 42000 },
  { id: 4, name: "Nova 产品发布会", type: "Product Launch", campaign: "新品 Nova 发布 Campaign", partner: "Northstar Creative", owner: "陈森", location: "上海 · 西岸艺术中心", startDate: "2026-11-06", endDate: "2026-11-06", status: "Planning", expectedAttendees: 500, actualAttendees: 0, budget: 380000 },
  { id: 5, name: "华南客户体验 Roadshow", type: "Roadshow", campaign: "年度客户体验巡展", partner: "未来制造社群", owner: "韩雪", location: "深圳 · 南山智园", startDate: "2026-11-18", endDate: "2026-11-20", status: "Upcoming", expectedAttendees: 360, actualAttendees: 0, budget: 126000 },
  { id: 6, name: "品牌合作伙伴峰会", type: "Event", campaign: "2026 Q4 品牌声量计划", partner: "Northstar Creative", owner: "林悦", location: "新加坡 · Marina Bay", startDate: "2026-10-25", endDate: "2026-10-26", status: "Upcoming", expectedAttendees: 220, actualAttendees: 0, budget: 195000 },
  { id: 7, name: "园区线下产品体验日", type: "Offline Promotion", campaign: "企业决策者内容推广", partner: "科技观察局", owner: "周岚", location: "北京 · 中关村软件园", startDate: "2026-09-10", endDate: "2026-09-10", status: "Completed", expectedAttendees: 150, actualAttendees: 173, budget: 58000 },
  { id: 8, name: "客户案例圆桌交流", type: "Event", campaign: "客户成功案例推广", partner: "BrightPath Consulting", owner: "杨帆", location: "悉尼 · Barangaroo", startDate: "2026-07-22", endDate: "2026-07-22", status: "Completed", expectedAttendees: 60, actualAttendees: 54, budget: 31000 },
  { id: 9, name: "渠道销售赋能直播", type: "Webinar", campaign: "渠道伙伴增长计划", partner: "华东渠道联盟", owner: "王明", location: "线上 · Teams", startDate: "2026-09-16", endDate: "2026-09-16", status: "Cancelled", expectedAttendees: 180, actualAttendees: 0, budget: 18000 },
  { id: 10, name: "东京行业媒体交流会", type: "Other", campaign: "亚太市场认知提升", partner: "Peak AV Solutions", owner: "叶宁", location: "东京 · 丸之内", startDate: "2026-12-03", endDate: "2026-12-03", status: "Planning", expectedAttendees: 90, actualAttendees: 0, budget: 65000 },
];
