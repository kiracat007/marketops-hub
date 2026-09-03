import { getSupabaseClient } from "@/lib/supabase/client";
import type { LeadRecord, LeadSource, LeadStatus } from "./types";

type LeadRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: LeadSource;
  campaign: string | null;
  activity: string | null;
  partner: string | null;
  status: LeadStatus;
  potential_value: number | string;
  owner: string | null;
  created_at: string;
};

export async function fetchLeadsFromSupabase(): Promise<LeadRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .select("id, name, company, email, phone, source, campaign, activity, partner, status, potential_value, owner, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as LeadRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    source: row.source,
    campaign: row.campaign ?? "未关联",
    activity: row.activity ?? "未关联",
    partner: row.partner ?? "未关联",
    status: row.status,
    potentialValue: Number(row.potential_value),
    owner: row.owner ?? "",
    createdAt: row.created_at.slice(0, 10),
  }));
}
