import type { LeadRecord } from "@/components/leads/types";
import type { Opportunity } from "@/components/opportunities/types";

export function calculateCampaignPerformance(leads: LeadRecord[], opportunities: Opportunity[]) {
  return {
    totalLeads: leads.length,
    qualifiedLeads: leads.filter((lead) => ["Qualified", "Opportunity", "Won"].includes(lead.status)).length,
    opportunities: opportunities.length,
    wonLeads: leads.filter((lead) => lead.status === "Won").length,
    pipelineValue: opportunities.filter((item) => item.stage !== "Lost").reduce((sum, item) => sum + item.value, 0),
  };
}
