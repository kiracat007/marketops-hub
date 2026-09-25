export const campaignStatuses = ["Planning", "Active", "Completed", "Paused"] as const;
export const campaignChannels = ["LinkedIn", "Instagram", "Facebook", "Event", "Webinar", "Offline"] as const;
export type CampaignStatus = (typeof campaignStatuses)[number];
export type CampaignChannel = (typeof campaignChannels)[number];
export type Campaign = { id: string | number; name: string; description?: string; goal?: string; channel: CampaignChannel; owner: string; budget: number; spend?: number; startDate: string; endDate: string; status: CampaignStatus; targetLeads: number; actualLeads: number; createdAt?: string; updatedAt?: string; };
export type CampaignDraft = Omit<Campaign, "id" | "actualLeads" | "createdAt" | "updatedAt">;
