import type { Activity } from "@/components/activities/types";
import type { LeadRecord, LeadSource } from "@/components/leads/types";
import type { Opportunity, OpportunityStage } from "@/components/opportunities/types";
import type { Campaign } from "./types";

export const openOpportunityStages: OpportunityStage[] = ["Discovery", "Proposal", "Negotiation"];
const qualifiedStatuses = ["Qualified", "Opportunity", "Won"];

export type PerformanceMetrics = {
  spend: number;
  leads: number;
  qualifiedLeads: number;
  opportunities: number;
  openOpportunities: number;
  wonOpportunities: number;
  lostOpportunities: number;
  openPipeline: number;
  wonRevenue: number;
  cpl: number | null;
  cpql: number | null;
  leadToOpportunityRate: number | null;
  winRate: number | null;
  roas: number | null;
  roi: number | null;
  targetLeadAttainment: number | null;
};

export type ActivityPerformance = { activity: Activity; metrics: PerformanceMetrics };
export type SourcePerformance = { source: LeadSource; leads: number; qualifiedLeads: number; opportunities: number; wonRevenue: number; conversionRate: number | null };
export type FunnelStage = { label: "Leads" | "Qualified" | "Opportunities" | "Won"; count: number; conversionFromPrevious: number | null };

export function safeRate(numerator: number, denominator: number, multiplier = 1): number | null {
  return denominator > 0 ? (numerator / denominator) * multiplier : null;
}

export function calculatePerformance(leads: LeadRecord[], opportunities: Opportunity[], spend = 0, targetLeads = 0): PerformanceMetrics {
  const qualifiedLeads = leads.filter((lead) => qualifiedStatuses.includes(lead.status)).length;
  const open = opportunities.filter((item) => openOpportunityStages.includes(item.stage));
  const won = opportunities.filter((item) => item.stage === "Won");
  const lost = opportunities.filter((item) => item.stage === "Lost");
  const wonRevenue = won.reduce((sum, item) => sum + item.value, 0);
  return {
    spend,
    leads: leads.length,
    qualifiedLeads,
    opportunities: opportunities.length,
    openOpportunities: open.length,
    wonOpportunities: won.length,
    lostOpportunities: lost.length,
    openPipeline: open.reduce((sum, item) => sum + item.value, 0),
    wonRevenue,
    cpl: safeRate(spend, leads.length),
    cpql: safeRate(spend, qualifiedLeads),
    leadToOpportunityRate: safeRate(opportunities.length, leads.length, 100),
    winRate: safeRate(won.length, won.length + lost.length, 100),
    roas: safeRate(wonRevenue, spend),
    roi: safeRate(wonRevenue - spend, spend, 100),
    targetLeadAttainment: safeRate(leads.length, targetLeads, 100),
  };
}

export function attributedCampaignId(opportunity: Opportunity, leads: LeadRecord[]) {
  if (opportunity.campaignId) return opportunity.campaignId;
  return leads.find((lead) => String(lead.id) === opportunity.leadId)?.campaignId ?? "";
}

export function calculateCampaignPerformance(leads: LeadRecord[], opportunities: Opportunity[], spend = 0, targetLeads = 0) {
  const metrics = calculatePerformance(leads, opportunities, spend, targetLeads);
  return { ...metrics, totalLeads: metrics.leads, pipelineValue: metrics.openPipeline, wonLeads: leads.filter((lead) => lead.status === "Won").length };
}

export function calculateActivityPerformance(activities: Activity[], leads: LeadRecord[], opportunities: Opportunity[]): ActivityPerformance[] {
  return activities.map((activity) => {
    const id = String(activity.id);
    const activityLeads = leads.filter((lead) => lead.activityId === id);
    const leadIds = new Set(activityLeads.map((lead) => String(lead.id)));
    const activityOpportunities = opportunities.filter((item) => item.leadId && leadIds.has(item.leadId));
    return { activity, metrics: calculatePerformance(activityLeads, activityOpportunities, activity.spend ?? 0, activity.targetLeads ?? 0) };
  });
}

export function calculateSourcePerformance(leads: LeadRecord[], opportunities: Opportunity[]): SourcePerformance[] {
  const sources = [...new Set(leads.map((lead) => lead.source))];
  return sources.map((source) => {
    const sourceLeads = leads.filter((lead) => lead.source === source);
    const leadIds = new Set(sourceLeads.map((lead) => String(lead.id)));
    const sourceOpportunities = opportunities.filter((item) => item.leadId && leadIds.has(item.leadId));
    return {
      source,
      leads: sourceLeads.length,
      qualifiedLeads: sourceLeads.filter((lead) => qualifiedStatuses.includes(lead.status)).length,
      opportunities: sourceOpportunities.length,
      wonRevenue: sourceOpportunities.filter((item) => item.stage === "Won").reduce((sum, item) => sum + item.value, 0),
      conversionRate: safeRate(sourceOpportunities.length, sourceLeads.length, 100),
    };
  }).sort((a, b) => b.wonRevenue - a.wonRevenue || b.opportunities - a.opportunities || b.leads - a.leads);
}

export function calculateMarketingFunnel(leads: LeadRecord[], opportunities: Opportunity[]): FunnelStage[] {
  const qualified = leads.filter((lead) => qualifiedStatuses.includes(lead.status)).length;
  const won = opportunities.filter((item) => item.stage === "Won").length;
  const counts = [leads.length, qualified, opportunities.length, won];
  const labels: FunnelStage["label"][] = ["Leads", "Qualified", "Opportunities", "Won"];
  return labels.map((label, index) => ({ label, count: counts[index], conversionFromPrevious: index === 0 ? null : safeRate(counts[index], counts[index - 1], 100) }));
}

export function calculateCampaignRows(campaigns: Campaign[], leads: LeadRecord[], opportunities: Opportunity[]) {
  return campaigns.map((campaign) => {
    const campaignId = String(campaign.id);
    const campaignLeads = leads.filter((lead) => lead.campaignId === campaignId);
    const campaignOpportunities = opportunities.filter((item) => attributedCampaignId(item, leads) === campaignId);
    return { campaign, metrics: calculatePerformance(campaignLeads, campaignOpportunities, campaign.spend ?? 0, campaign.targetLeads) };
  });
}

export function rankCampaignPerformance<T extends { metrics: PerformanceMetrics }>(rows: T[]) {
  return [...rows].sort((a, b) => {
    if (a.metrics.roi !== null || b.metrics.roi !== null) return (b.metrics.roi ?? Number.NEGATIVE_INFINITY) - (a.metrics.roi ?? Number.NEGATIVE_INFINITY);
    return b.metrics.wonRevenue - a.metrics.wonRevenue || b.metrics.openPipeline - a.metrics.openPipeline;
  });
}

export function selectBestActivity(rows: ActivityPerformance[]) {
  return rankCampaignPerformance(rows)[0] ?? null;
}

export function performanceHighlights(campaign: Campaign, metrics: PerformanceMetrics, activities: ActivityPerformance[]) {
  const messages: string[] = [];
  if (metrics.roi !== null) messages.push(metrics.roi > 0 ? "当前 Campaign 已实现正向 ROI。" : metrics.roi < 0 ? "当前 Campaign 的收入尚未覆盖已记录支出。" : "当前 Campaign 收入与已记录支出持平。");
  if ((campaign.spend ?? 0) > campaign.budget) messages.push("Campaign 已记录支出超过预算。 ");
  if (metrics.targetLeadAttainment !== null && metrics.targetLeadAttainment >= 100) messages.push("Lead 目标已经达成。");
  const withCpl = activities.filter((row) => row.metrics.cpl !== null).sort((a, b) => (a.metrics.cpl ?? Infinity) - (b.metrics.cpl ?? Infinity));
  if (withCpl[0]) messages.push(`${withCpl[0].activity.name} 当前 CPL 最低。`);
  const revenueLeader = [...activities].sort((a, b) => b.metrics.wonRevenue - a.metrics.wonRevenue)[0];
  if (revenueLeader && revenueLeader.metrics.wonRevenue > 0) messages.push(`${revenueLeader.activity.name} 产生了最高 Won Revenue。`);
  return messages;
}

export function generateCampaignReportSummary(campaign: Campaign, metrics: PerformanceMetrics, activities: ActivityPerformance[]) {
  const best = selectBestActivity(activities);
  const conversion = metrics.leadToOpportunityRate === null ? "暂无可计算的 Lead 到 Opportunity 转化率" : `Lead 到 Opportunity 转化率为 ${metrics.leadToOpportunityRate.toFixed(1)}%`;
  const budget = (campaign.spend ?? 0) > campaign.budget ? "已记录支出超过预算" : `已使用预算的 ${campaign.budget > 0 ? (((campaign.spend ?? 0) / campaign.budget) * 100).toFixed(1) : "—"}%`;
  const activityText = best ? `表现领先的 Activity 是 ${best.activity.name}，其 Won Revenue 为 ${best.metrics.wonRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}。` : "当前没有可比较的 Activity 数据。";
  const outcome = metrics.roi === null ? "由于 Spend 为 0，ROI 暂不可计算。" : `Won Revenue 为 ${metrics.wonRevenue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}，ROI 为 ${metrics.roi.toFixed(1)}%。`;
  return `${campaign.name} 共获得 ${metrics.leads} 条 Leads，其中 ${metrics.qualifiedLeads} 条达到 Qualified 标准，并形成 ${metrics.opportunities} 个 Opportunities。${conversion}。${activityText}${budget}。${outcome}`;
}
