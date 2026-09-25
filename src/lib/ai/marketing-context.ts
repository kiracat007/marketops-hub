import type { Activity } from "@/components/activities/types";
import { calculateActivityPerformance, calculateCampaignRows, calculateMarketingFunnel, calculatePerformance, calculateSourcePerformance, rankCampaignPerformance } from "@/components/campaigns/performance";
import type { Campaign } from "@/components/campaigns/types";
import { getFollowUpTiming } from "@/components/leads/follow-up";
import type { LeadRecord } from "@/components/leads/types";
import type { Opportunity } from "@/components/opportunities/types";
import type { Partner } from "@/components/partners/types";
import { getTaskDueCategory } from "@/components/tasks/logic";
import type { Task } from "@/components/tasks/types";
import type { MarketingSnapshot } from "./types";

type WorkspaceData = { campaigns: Campaign[]; activities: Activity[]; partners: Partner[]; leads: LeadRecord[]; opportunities: Opportunity[]; tasks: Task[]; now?: Date };

function sharedSnapshot(data: WorkspaceData, scope: MarketingSnapshot["scope"]): MarketingSnapshot {
  const now = data.now ?? new Date();
  const today = now.toISOString().slice(0, 10);
  const totalSpend = data.campaigns.reduce((sum, item) => sum + (item.spend ?? 0), 0);
  const performance = calculatePerformance(data.leads, data.opportunities, totalSpend, data.campaigns.reduce((sum, item) => sum + item.targetLeads, 0));
  return {
    asOf: now.toISOString(),
    scope,
    totals: {
      campaigns: data.campaigns.length,
      activeCampaigns: data.campaigns.filter((item) => item.status === "Active").length,
      activities: data.activities.length,
      upcomingActivities: data.activities.filter((item) => item.startDate >= today && !["Completed", "Cancelled"].includes(item.status)).length,
      partners: data.partners.length,
      leads: performance.leads,
      qualifiedLeads: performance.qualifiedLeads,
      leadsWithOpportunity: performance.leadsWithOpportunity,
      opportunities: performance.opportunities,
      openOpportunities: performance.openOpportunities,
      wonOpportunities: performance.wonOpportunities,
      wonLeads: performance.wonLeads,
      overdueFollowUps: data.leads.filter((item) => getFollowUpTiming(item.nextFollowUpAt, item.followUpStatus, now) === "overdue").length,
      openTasks: data.tasks.filter((item) => !["Completed", "Cancelled"].includes(item.status)).length,
      overdueTasks: data.tasks.filter((item) => getTaskDueCategory(item, now) === "overdue").length,
      tasksDueToday: data.tasks.filter((item) => getTaskDueCategory(item, now) === "today").length,
      leadsWithoutNextFollowUp: data.leads.filter((item) => item.status === "New" && !item.nextFollowUpAt).length,
    },
    financials: { spend: performance.spend, openPipeline: performance.openPipeline, wonRevenue: performance.wonRevenue, roi: performance.roi, roas: performance.roas },
    funnel: calculateMarketingFunnel(data.leads, data.opportunities).map((item) => ({ stage: item.label, count: item.count, conversionFromPrevious: item.conversionFromPrevious })),
    dataNotes: ["This is a current operational snapshot, not a verified week-over-week trend.", "Revenue includes Won opportunities only.", "No personal contact details or free-form notes are included."],
  };
}

export function buildWeeklyMarketingContext(data: WorkspaceData): MarketingSnapshot {
  const snapshot = sharedSnapshot(data, "workspace");
  const rows = rankCampaignPerformance(calculateCampaignRows(data.campaigns, data.leads, data.opportunities)).slice(0, 5);
  snapshot.campaignPerformance = rows.map(({ campaign, metrics }) => ({ name: campaign.name, status: campaign.status, spend: metrics.spend, leads: metrics.leads, qualifiedLeads: metrics.qualifiedLeads, openPipeline: metrics.openPipeline, wonRevenue: metrics.wonRevenue, roi: metrics.roi, targetAttainment: metrics.targetLeadAttainment }));
  snapshot.activityPerformance = calculateActivityPerformance(data.activities, data.leads, data.opportunities).map(({ activity, metrics }) => ({ type: activity.type, spend: metrics.spend, leads: metrics.leads, qualifiedLeads: metrics.qualifiedLeads, openPipeline: metrics.openPipeline, wonRevenue: metrics.wonRevenue, cpl: metrics.cpl, roi: metrics.roi }));
  snapshot.sourcePerformance = calculateSourcePerformance(data.leads, data.opportunities);
  snapshot.upcomingSchedule = [...data.activities]
    .filter((item) => item.startDate >= (data.now ?? new Date()).toISOString().slice(0, 10) && !["Completed", "Cancelled"].includes(item.status))
    .sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 5)
    .map((item) => ({ type: item.type, date: item.startDate, status: item.status }));
  return snapshot;
}

export function buildCampaignReviewContext(campaign: Campaign, data: Omit<WorkspaceData, "campaigns" | "partners">): MarketingSnapshot {
  const campaignId = String(campaign.id);
  const leadIds = new Set(data.leads.map((item) => String(item.id)));
  const tasks = data.tasks.filter((item) => item.campaignId === campaignId || (item.leadId && leadIds.has(item.leadId)));
  const snapshot = sharedSnapshot({ ...data, tasks, campaigns: [campaign], partners: [] }, "campaign");
  snapshot.campaign = { id: campaignId, name: campaign.name, status: campaign.status, budget: campaign.budget, spend: campaign.spend ?? 0, startDate: campaign.startDate, endDate: campaign.endDate, targetLeads: campaign.targetLeads };
  snapshot.activityPerformance = calculateActivityPerformance(data.activities, data.leads, data.opportunities).map(({ activity, metrics }) => ({ type: activity.type, spend: metrics.spend, leads: metrics.leads, qualifiedLeads: metrics.qualifiedLeads, openPipeline: metrics.openPipeline, wonRevenue: metrics.wonRevenue, cpl: metrics.cpl, roi: metrics.roi }));
  snapshot.sourcePerformance = calculateSourcePerformance(data.leads, data.opportunities);
  return snapshot;
}
