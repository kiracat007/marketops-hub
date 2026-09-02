export const partnerTypes = ["KOL", "Influencer", "Agency", "Dealer", "Vendor", "Media", "Other"] as const;
export const partnerStatuses = ["Prospect", "Contacted", "Active", "Inactive"] as const;

export type PartnerType = (typeof partnerTypes)[number];
export type PartnerStatus = (typeof partnerStatuses)[number];

export type Partner = {
  id: number;
  name: string;
  type: PartnerType;
  company: string;
  region: string;
  contactName: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  campaigns: number;
  leadsGenerated: number;
};

export type PartnerDraft = Omit<Partner, "id">;
