export const opportunityStages = ["Discovery", "Proposal", "Negotiation", "Won", "Lost"] as const;
export type OpportunityStage = (typeof opportunityStages)[number];
export type Opportunity = { id: string; leadId: string; campaignId: string; name: string; company: string; stage: OpportunityStage; value: number; owner: string; expectedCloseDate: string; notes: string; createdAt: string; updatedAt: string; };
export type OpportunityDraft = Omit<Opportunity, "id" | "createdAt" | "updatedAt">;
