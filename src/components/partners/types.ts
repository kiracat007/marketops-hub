export const partnerTypes = ["KOL", "Influencer", "Agency", "Dealer", "Distributor", "Vendor", "Media", "Other"] as const;
export const partnerStatuses = ["Prospect", "Active", "Inactive"] as const;
export type PartnerType = (typeof partnerTypes)[number]; export type PartnerStatus = (typeof partnerStatuses)[number];
export type Partner = { id: string | number; name: string; type: PartnerType; company: string; region: string; email: string; phone: string; status: PartnerStatus; notes?: string; activityCount?: number; leadCount?: number; contactName?: string; campaigns?: number; leadsGenerated?: number; createdAt?: string; updatedAt?: string; };
export type PartnerDraft = Pick<Partner, "name" | "type" | "company" | "region" | "email" | "phone" | "status" | "notes">;
