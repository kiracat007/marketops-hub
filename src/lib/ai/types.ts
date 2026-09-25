export type InsightKind = "weekly-brief" | "campaign-review";
export type InsightMode = "live" | "preview";

export type InsightResult = {
  title: string;
  summary: string;
  highlights: string[];
  risks: string[];
  recommendedActions: string[];
  analysisSections: Array<{ title: string; detail: string }>;
  dataNotes: string[];
};

export type MarketingSnapshot = {
  asOf: string;
  scope: "workspace" | "campaign";
  campaign?: { id: string; name: string; status: string; budget: number; spend: number; startDate: string; endDate: string; targetLeads: number };
  totals: {
    campaigns: number;
    activeCampaigns: number;
    activities: number;
    upcomingActivities: number;
    partners: number;
    leads: number;
    qualifiedLeads: number;
    leadsWithOpportunity: number;
    opportunities: number;
    openOpportunities: number;
    wonOpportunities: number;
    wonLeads: number;
    overdueFollowUps: number;
    openTasks: number;
    overdueTasks: number;
    tasksDueToday: number;
    leadsWithoutNextFollowUp: number;
  };
  financials: { spend: number; openPipeline: number; wonRevenue: number; roi: number | null; roas: number | null };
  funnel: Array<{ stage: string; count: number; conversionFromPrevious: number | null }>;
  campaignPerformance?: Array<{ name: string; status: string; spend: number; leads: number; qualifiedLeads: number; openPipeline: number; wonRevenue: number; roi: number | null; targetAttainment: number | null }>;
  activityPerformance?: Array<{ type: string; spend: number; leads: number; qualifiedLeads: number; openPipeline: number; wonRevenue: number; cpl: number | null; roi: number | null }>;
  sourcePerformance?: Array<{ source: string; leads: number; qualifiedLeads: number; opportunities: number; wonRevenue: number; conversionRate: number | null }>;
  upcomingSchedule?: Array<{ type: string; date: string; status: string }>;
  dataNotes: string[];
};

export type InsightResponse = { mode: InsightMode; result: InsightResult; fallbackReason?: string };
