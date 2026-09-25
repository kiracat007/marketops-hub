import type { LeadRecord } from "@/components/leads/types";
import type { Opportunity } from "@/components/opportunities/types";

export function calculateCampaignPerformance(leads: LeadRecord[], opportunities: Opportunity[]) {
  const openStages = ["Discovery", "Proposal", "Negotiation"];
  return {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter((lead) => ["Qualified", "Opportunity", "Won"].includes(lead.status)).length,
    opportunities: opportunities.length,
    wonLeads: leads.filter((lead) => lead.status === "Won").length,
    pipelineValue: opportunities.filter((item) => openStages.includes(item.stage)).reduce((sum, item) => sum + item.value, 0),
    wonRevenue: opportunities.filter((item) => item.stage === "Won").reduce((sum, item) => sum + item.value, 0),
  };
}
