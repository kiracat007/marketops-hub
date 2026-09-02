export const leadSources = ["Campaign", "Event", "Field Demo", "Webinar", "Partner", "Organic", "Other"] as const;
export const leadStatuses = ["New", "Contacted", "Qualified", "Opportunity", "Won", "Lost"] as const;

export type LeadSource = (typeof leadSources)[number];
export type LeadStatus = (typeof leadStatuses)[number];

export type Lead = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  campaign: string;
  activity: string;
  partner: string;
  status: LeadStatus;
  potentialValue: number;
  owner: string;
  createdAt: string;
};

export type LeadDraft = Omit<Lead, "id">;
