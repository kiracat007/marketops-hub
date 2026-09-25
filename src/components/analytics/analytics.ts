import type { Activity } from "@/components/activities/types";
import { calculateCampaignRows, calculateMarketingFunnel, calculatePerformance, safeRate } from "@/components/campaigns/performance";
import type { Campaign } from "@/components/campaigns/types";
import { getFollowUpTiming } from "@/components/leads/follow-up";
import type { LeadRecord } from "@/components/leads/types";
import type { Opportunity } from "@/components/opportunities/types";
import { getTaskDueCategory } from "@/components/tasks/logic";
import type { Task } from "@/components/tasks/types";

const qualified = new Set(["Qualified", "Opportunity", "Won"]);
export const SMALL_SAMPLE_THRESHOLD = 5;
export type SegmentDimension = "Campaign" | "Source" | "Activity Type" | "Owner";

export function groupByDimension<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((groups, item) => { const value = key(item) || "Unassigned"; (groups[value] ??= []).push(item); return groups; }, {});
}

export function calculateCampaignComparison(campaigns: Campaign[], leads: LeadRecord[], opportunities: Opportunity[]) {
  return calculateCampaignRows(campaigns, leads, opportunities).map(({ campaign, metrics }) => ({
    campaign, metrics,
    budgetUtilization: safeRate(campaign.spend ?? 0, campaign.budget, 100),
    qualifiedRate: safeRate(metrics.qualifiedLeads, metrics.leads, 100),
  }));
}

export function calculateSourceAnalysis(leads: LeadRecord[], opportunities: Opportunity[]) {
  const linked = new Map(leads.map((lead) => [String(lead.id), lead]));
  const groups = groupByDimension(leads, (lead) => lead.source || "Unattributed");
  const rows = Object.entries(groups).map(([source, sourceLeads]) => {
    const ids = new Set(sourceLeads.map((lead) => String(lead.id)));
    const sourceOpps = opportunities.filter((item) => item.leadId && ids.has(item.leadId));
    const leadsWithOpportunity = new Set(sourceOpps.map((item) => item.leadId)).size;
    const wonLeads = new Set(sourceOpps.filter((item) => item.stage === "Won").map((item) => item.leadId)).size;
    return { source, leads: sourceLeads.length, qualifiedLeads: sourceLeads.filter((lead) => qualified.has(lead.status)).length, qualifiedRate: safeRate(sourceLeads.filter((lead) => qualified.has(lead.status)).length, sourceLeads.length, 100), leadsWithOpportunity, opportunityRate: safeRate(leadsWithOpportunity, sourceLeads.length, 100), wonLeads, wonRevenue: sourceOpps.filter((item) => item.stage === "Won").reduce((sum, item) => sum + item.value, 0), smallSample: sourceLeads.length < SMALL_SAMPLE_THRESHOLD };
  });
  return { rows: rows.sort((a, b) => b.leads - a.leads), unattributedOpportunities: opportunities.filter((item) => !item.leadId || !linked.has(item.leadId)).length };
}

function median(values: number[]) { if (!values.length) return null; const sorted=[...values].sort((a,b)=>a-b); const middle=Math.floor(sorted.length/2); return sorted.length%2 ? sorted[middle] : (sorted[middle-1]+sorted[middle])/2; }

export function classifySourceQuality(rows: ReturnType<typeof calculateSourceAnalysis>["rows"]) {
  const medianVolume = median(rows.map((row) => row.leads)) ?? 0;
  const medianQuality = median(rows.map((row) => row.qualifiedRate ?? 0)) ?? 0;
  return rows.map((row) => ({ ...row, classification: `${row.leads >= medianVolume ? "High Volume" : "Low Volume"} / ${(row.qualifiedRate ?? 0) >= medianQuality ? "High Quality" : "Low Quality"}`, medianVolume, medianQuality }));
}

export function calculateFunnelDiagnostics(leads: LeadRecord[], opportunities: Opportunity[]) {
  const funnel = calculateMarketingFunnel(leads, opportunities);
  const rows = funnel.map((stage, index) => ({ ...stage, dropOffCount: index === 0 ? 0 : Math.max(funnel[index - 1].count - stage.count, 0), dropOffRate: index === 0 ? null : safeRate(Math.max(funnel[index - 1].count - stage.count, 0), funnel[index - 1].count, 100) }));
  const largest = rows.slice(1).sort((a,b)=>b.dropOffCount-a.dropOffCount)[0] ?? null;
  return { rows, largestDropOff: largest ? `${funnel[rows.indexOf(largest)-1].label} → ${largest.label}` : null };
}

export function calculateFunnelBreakdown(leads: LeadRecord[], opportunities: Opportunity[], activities: Activity[], dimension: "Campaign" | "Source" | "Activity Type") {
  const activityTypes = new Map(activities.map((item) => [String(item.id), item.type]));
  const groups = groupByDimension(leads, (lead) => dimension === "Campaign" ? lead.campaign || "Unassigned" : dimension === "Source" ? lead.source : activityTypes.get(lead.activityId ?? "") ?? "Unassigned");
  return Object.entries(groups).map(([segment, segmentLeads]) => { const ids=new Set(segmentLeads.map((lead)=>String(lead.id))); return { segment, funnel: calculateMarketingFunnel(segmentLeads, opportunities.filter((item)=>item.leadId&&ids.has(item.leadId))), smallSample: segmentLeads.length < SMALL_SAMPLE_THRESHOLD }; });
}

export function calculateFollowUpEffectiveness(leads: LeadRecord[], opportunities: Opportunity[]) {
  return [true,false].map((contacted) => { const items=leads.filter((lead)=>Boolean(lead.lastContactedAt)===contacted); const ids=new Set(items.map((lead)=>String(lead.id))); const withOpp=new Set(opportunities.filter((item)=>item.leadId&&ids.has(item.leadId)).map((item)=>item.leadId)).size; return { label: contacted ? "Contacted" : "Not Contacted", leads: items.length, qualifiedRate: safeRate(items.filter((lead)=>qualified.has(lead.status)).length,items.length,100), opportunityRate:safeRate(withOpp,items.length,100), smallSample:items.length<SMALL_SAMPLE_THRESHOLD }; });
}

export function firstContactHours(lead: LeadRecord) { if(!lead.createdAt||!lead.lastContactedAt)return null; const hours=(new Date(lead.lastContactedAt).getTime()-new Date(lead.createdAt).getTime())/36e5; return Number.isFinite(hours)&&hours>=0?hours:null; }
export function followUpSpeedBucket(hours: number | null) { if(hours===null)return "No contact"; if(hours<24)return "Same day"; if(hours<96)return "1–3 days"; if(hours<192)return "4–7 days"; return "7+ days"; }
export function medianFirstContactHours(leads: LeadRecord[]) { return median(leads.map(firstContactHours).filter((value):value is number=>value!==null)); }

export function calculateFollowUpSpeed(leads: LeadRecord[], opportunities: Opportunity[]) {
  const groups=groupByDimension(leads,(lead)=>followUpSpeedBucket(firstContactHours(lead)));
  return Object.entries(groups).map(([bucket,items])=>{const ids=new Set(items.map((lead)=>String(lead.id)));const withOpp=new Set(opportunities.filter((item)=>item.leadId&&ids.has(item.leadId)).map((item)=>item.leadId)).size;return{bucket,leads:items.length,qualifiedRate:safeRate(items.filter((lead)=>qualified.has(lead.status)).length,items.length,100),opportunityRate:safeRate(withOpp,items.length,100),smallSample:items.length<SMALL_SAMPLE_THRESHOLD};});
}

export function calculateOverdueFollowUps(leads: LeadRecord[], now=new Date()) { const items=leads.filter((lead)=>getFollowUpTiming(lead.nextFollowUpAt,lead.followUpStatus,now)==="overdue"); return { count:items.length, dueToday:leads.filter((lead)=>getFollowUpTiming(lead.nextFollowUpAt,lead.followUpStatus,now)==="today").length, noNextFollowUp:leads.filter((lead)=>!["Won","Lost"].includes(lead.status)&&!lead.nextFollowUpAt).length, byStatus:Object.entries(groupByDimension(items,(lead)=>lead.status)).map(([status,rows])=>({status,count:rows.length})) }; }

export function calculateOwnerAnalysis(leads: LeadRecord[], opportunities: Opportunity[], tasks: Task[], now=new Date()) {
  const owners=[...new Set([...leads.map((item)=>item.owner),...tasks.map((item)=>item.owner)].filter(Boolean))];
  return owners.map((owner)=>{const ownerLeads=leads.filter((item)=>item.owner===owner);const ids=new Set(ownerLeads.map((item)=>String(item.id)));return{owner,assignedLeads:ownerLeads.length,qualifiedRate:safeRate(ownerLeads.filter((item)=>qualified.has(item.status)).length,ownerLeads.length,100),leadsWithOpportunity:new Set(opportunities.filter((item)=>item.leadId&&ids.has(item.leadId)).map((item)=>item.leadId)).size,openTasks:tasks.filter((item)=>item.owner===owner&&!['Completed','Cancelled'].includes(item.status)).length,overdueTasks:tasks.filter((item)=>item.owner===owner&&getTaskDueCategory(item,now)==="overdue").length};});
}

export function weeklyTrend<T>(items:T[], date:(item:T)=>string, now=new Date(), weeks=8) { const start=new Date(now); start.setUTCHours(0,0,0,0); start.setUTCDate(start.getUTCDate()-start.getUTCDay()-7*(weeks-1)); const result=Array.from({length:weeks},(_,index)=>{const from=new Date(start);from.setUTCDate(from.getUTCDate()+index*7);return{week:from.toISOString().slice(0,10),count:0};}); for(const item of items){const parsed=new Date(date(item));if(Number.isNaN(parsed.getTime())||parsed<start||parsed>now)continue;const index=Math.floor((parsed.getTime()-start.getTime())/(7*864e5));if(result[index])result[index].count++;} const first=result.findIndex(row=>row.count>0); return first<0?[]:result.slice(first); }
export function comparePeriods(current:number,previous:number){return{current,previous,absoluteChange:current-previous,percentageChange:previous===0?null:((current-previous)/previous)*100};}

export function calculateSegmentMetrics(leads:LeadRecord[],opportunities:Opportunity[]){return calculatePerformance(leads,opportunities);}

export function calculateDataQuality(campaigns:Campaign[],leads:LeadRecord[],opportunities:Opportunity[],tasks:Task[]){const count=<T,>(items:T[],valid:(item:T)=>boolean)=>({complete:items.filter(valid).length,total:items.length,coverage:safeRate(items.filter(valid).length,items.length,100)});return{
  campaignAttribution:count(leads,(item)=>Boolean(item.campaignId)),sourceCoverage:count(leads,(item)=>Boolean(item.source)),ownerCoverage:count(leads,(item)=>Boolean(item.owner)),opportunityLeadCoverage:count(opportunities,(item)=>Boolean(item.leadId)),taskOwnerCoverage:count(tasks,(item)=>Boolean(item.owner)),campaignSpendCoverage:count(campaigns,(item)=>(item.spend??0)>0),campaignTargetCoverage:count(campaigns,(item)=>item.targetLeads>0),
};}
