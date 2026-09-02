export const campaignStatuses = ["Planning", "Active", "Completed"] as const;
export const campaignChannels = ["LinkedIn", "Instagram", "Facebook", "Event", "Webinar", "Offline"] as const;

export type CampaignStatus = (typeof campaignStatuses)[number];
export type CampaignChannel = (typeof campaignChannels)[number];

export type Campaign = {
  id: number;
  name: string;
  channel: CampaignChannel;
  owner: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  targetLeads: number;
  actualLeads: number;
};

export type CampaignDraft = Omit<Campaign, "id">;
