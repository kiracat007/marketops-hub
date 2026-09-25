import { getSupabaseClient } from "@/lib/supabase/client";
import type { LeadDraft, LeadRecord, LeadSource, LeadStatus } from "./types";

const leadColumns = "id, name, company, email, phone, source, campaign, activity, partner, campaign_id, activity_id, partner_id, status, potential_value, owner, created_at";

export type LeadRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  campaign: string | null;
  activity: string | null;
  partner: string | null;
  campaign_id?: string | null;
  activity_id?: string | null;
  partner_id?: string | null;
  status: LeadStatus;
  potential_value: number | string;
  owner: string | null;
  created_at: string;
};

export async function fetchLeadsFromSupabase(): Promise<LeadRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .select(leadColumns)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as LeadRow[]).map(mapLeadRow);
}

export async function createLeadInSupabase(draft: LeadDraft): Promise<LeadRecord> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .insert(toLeadRow(draft))
    .select(leadColumns)
    .single();

  if (error) throw error;
  return mapLeadRow(data as LeadRow);
}

export async function createLeadsBatchInSupabase(drafts: LeadDraft[]): Promise<LeadRecord[]> {
  if (drafts.length === 0) return [];

  const { data, error } = await getSupabaseClient()
    .from("leads")
    .insert(drafts.map(toLeadRow))
    .select(leadColumns);

  if (error) throw error;
  return ((data ?? []) as LeadRow[]).map(mapLeadRow);
}

export async function updateLeadInSupabase(id: string, draft: LeadDraft): Promise<LeadRecord> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .update(toLeadRow(draft))
    .eq("id", id)
    .select(leadColumns)
    .single();

  if (error) throw error;
  return mapLeadRow(data as LeadRow);
}

export async function deleteLeadFromSupabase(id: string): Promise<void> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  if (!data) throw new Error("Supabase 没有返回被删除的 Lead。");
}

export function toLeadRow(draft: LeadDraft) {
  return {
    name: draft.name,
    company: draft.company,
    email: draft.email || null,
    phone: draft.phone,
    source: draft.source,
    campaign: draft.campaign,
    activity: draft.activity,
    partner: draft.partner,
    campaign_id: draft.campaignId || null,
    activity_id: draft.activityId || null,
    partner_id: draft.partnerId || null,
    status: draft.status,
    potential_value: draft.potentialValue,
    owner: draft.owner,
    created_at: draft.createdAt,
  };
}

export function mapLeadRow(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    source: row.source,
    campaign: row.campaign ?? "未关联",
    activity: row.activity ?? "未关联",
    partner: row.partner ?? "未关联",
    campaignId: row.campaign_id ?? "",
    activityId: row.activity_id ?? "",
    partnerId: row.partner_id ?? "",
    status: row.status,
    potentialValue: Number(row.potential_value),
    owner: row.owner ?? "",
    createdAt: row.created_at.slice(0, 10),
  };
}
