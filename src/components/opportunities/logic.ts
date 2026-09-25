import type { LeadRecord, LeadStatus } from "@/components/leads/types";
import type { Opportunity, OpportunityDraft, OpportunityStage } from "./types";

const openStages: OpportunityStage[] = ["Discovery", "Proposal", "Negotiation"];

export function calculatePipelineSummary(opportunities: Opportunity[]) {
  const open = opportunities.filter((item) => openStages.includes(item.stage));
  const won = opportunities.filter((item) => item.stage === "Won");
  const lost = opportunities.filter((item) => item.stage === "Lost");
  const closedCount = won.length + lost.length;
  return {
    openPipeline: open.reduce((sum, item) => sum + item.value, 0),
    wonRevenue: won.reduce((sum, item) => sum + item.value, 0),
    openOpportunities: open.length,
    winRate: closedCount === 0 ? 0 : Math.round((won.length / closedCount) * 100),
  };
}

export function prefillOpportunityFromLead(lead: LeadRecord): OpportunityDraft {
  return {
    leadId: typeof lead.id === "string" ? lead.id : "",
    campaignId: lead.campaignId ?? "",
    name: `${lead.company.trim() || lead.name.trim()} Opportunity`,
    company: lead.company,
    stage: "Discovery",
    value: lead.potentialValue,
    owner: lead.owner,
    expectedCloseDate: "",
    notes: "",
  };
}

export function leadStatusAfterOpportunityCreation(status: LeadStatus): LeadStatus | null {
  return ["New", "Contacted", "Qualified"].includes(status) ? "Opportunity" : null;
}

export function leadStatusAfterStageChange(stage: OpportunityStage): LeadStatus | null {
  if (stage === "Won") return "Won";
  if (stage === "Lost") return "Lost";
  // Reopening a closed Opportunity never downgrades the Lead lifecycle.
  return null;
}
