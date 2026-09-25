import type { InsightKind, InsightResult, MarketingSnapshot } from "./types";

const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function generateRuleBasedInsight(kind: InsightKind, context: MarketingSnapshot): InsightResult {
  const { totals, financials } = context;
  const highlights: string[] = [];
  const risks: string[] = [];
  const actions: string[] = [];
  if (financials.roi !== null && financials.roi > 0) highlights.push(`Recorded ROI is positive at ${financials.roi.toFixed(1)}%.`);
  if (financials.wonRevenue > 0) highlights.push(`${money(financials.wonRevenue)} in Won revenue is recorded.`);
  if (totals.leadsWithOpportunity > 0) highlights.push(`${totals.leadsWithOpportunity} unique leads have at least one opportunity.`);
  if (context.campaign && context.campaign.spend > context.campaign.budget) risks.push(`Recorded spend exceeds budget by ${money(context.campaign.spend - context.campaign.budget)}.`);
  if (context.campaign && context.campaign.budget > 0 && context.campaign.targetLeads > 0 && context.campaign.spend / context.campaign.budget > 0.8 && totals.leads / context.campaign.targetLeads < 0.8) risks.push("Lead target attainment is below 80% while more than 80% of the recorded budget has been used.");
  if (totals.overdueFollowUps > 0) risks.push(`${totals.overdueFollowUps} lead follow-up${totals.overdueFollowUps === 1 ? " is" : "s are"} overdue.`);
  if (totals.overdueTasks > 0) risks.push(`${totals.overdueTasks} open task${totals.overdueTasks === 1 ? " is" : "s are"} overdue.`);
  if (totals.leads > 0 && totals.leadsWithOpportunity / totals.leads < 0.25) risks.push("Fewer than 25% of leads currently have an opportunity.");
  if (totals.overdueFollowUps > 0) actions.push("Review overdue lead follow-ups and assign a clear next action.");
  if (totals.overdueTasks > 0) actions.push("Prioritize overdue tasks by commercial impact and due date.");
  if (totals.leads > totals.qualifiedLeads) actions.push("Review unqualified leads and close or advance the highest-potential records.");
  if (!actions.length) actions.push("Review the current snapshot with the campaign owner and confirm the next measurable action.");
  if (!highlights.length) highlights.push("The current data does not yet show a strong revenue or conversion highlight.");
  if (!risks.length) risks.push("No threshold-based risk was detected; this does not replace human review.");
  return {
    title: kind === "weekly-brief" ? "AI Marketing Brief" : `${context.campaign?.name ?? "Campaign"} AI Review`,
    summary: `Current snapshot: ${totals.leads} leads, ${totals.opportunities} opportunities, ${money(financials.openPipeline)} open pipeline, and ${money(financials.wonRevenue)} Won revenue.`,
    highlights: highlights.slice(0, 5), risks: risks.slice(0, 5), recommendedActions: actions.slice(0, 5),
    analysisSections: kind === "campaign-review" ? [
      { title: "Overall Assessment", detail: `The current snapshot contains ${totals.leads} leads and ${totals.opportunities} opportunity records.` },
      { title: "What Worked", detail: highlights[0] }, { title: "What Needs Attention", detail: risks[0] },
      { title: "Activity Analysis", detail: context.activityPerformance?.length ? `${context.activityPerformance.length} activity performance rows were reviewed.` : "No activity performance data is available." },
      { title: "Funnel Analysis", detail: `${totals.leadsWithOpportunity} unique leads have an opportunity and ${totals.wonLeads} unique leads have a Won opportunity.` },
      { title: "Budget / ROI Analysis", detail: `Recorded spend is ${money(financials.spend)} and current ROI is ${financials.roi === null ? "not calculable" : `${financials.roi.toFixed(1)}%`}.` },
      { title: "Recommended Next Actions", detail: actions[0] }, { title: "Data Limitations", detail: context.dataNotes[0] },
    ] : [],
    dataNotes: [...context.dataNotes, "Generated with deterministic rules; no external AI request was made."].slice(0, 5),
  };
}
