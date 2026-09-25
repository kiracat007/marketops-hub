export const leadSources = ["Campaign", "Event", "Field Demo", "Webinar", "Partner", "Organic", "Other"] as const;
export const leadStatuses = ["New", "Contacted", "Qualified", "Opportunity", "Won", "Lost"] as const;
export const followUpStatuses = ["Not Started", "In Progress", "Waiting", "Completed"] as const;

export type LeadSource = (typeof leadSources)[number];
export type LeadStatus = (typeof leadStatuses)[number];
export type FollowUpStatus = (typeof followUpStatuses)[number];

export type Lead = {
  id: number | string;
  campaignId?: string;
  activityId?: string;
  partnerId?: string;
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
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  followUpStatus?: FollowUpStatus | "";
  notes?: string;
};

export type LeadRecord = Lead;
export type LeadDraft = Omit<Lead, "id">;
