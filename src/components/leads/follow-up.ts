import type { FollowUpStatus, LeadRecord, LeadStatus } from "./types";

export type FollowUpTiming = "overdue" | "today" | "upcoming" | "none" | "completed";
export type LeadQuickFilter = "all" | "needs" | "today" | "overdue" | "none";

function localDay(value: Date) { return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`; }

export function getFollowUpTiming(nextFollowUpAt: string | undefined, status: FollowUpStatus | "" | undefined, now = new Date()): FollowUpTiming {
  if (status === "Completed") return "completed";
  if (!nextFollowUpAt) return "none";
  const due = new Date(nextFollowUpAt);
  if (Number.isNaN(due.getTime())) return "none";
  if (localDay(due) === localDay(now)) return "today";
  return due < now ? "overdue" : "upcoming";
}

export function markAsContactedChanges(lead: Pick<LeadRecord,"status"|"followUpStatus">, now = new Date()): { lastContactedAt: string; status: LeadStatus; followUpStatus: FollowUpStatus | "" } {
  return {
    lastContactedAt: now.toISOString(),
    status: lead.status === "New" ? "Contacted" : lead.status,
    followUpStatus: !lead.followUpStatus || lead.followUpStatus === "Not Started" ? "In Progress" : lead.followUpStatus,
  };
}

export function matchesLeadQuickFilter(lead: LeadRecord, filter: LeadQuickFilter, now = new Date()) {
  if (filter === "all") return true;
  const timing = getFollowUpTiming(lead.nextFollowUpAt, lead.followUpStatus, now);
  if (filter === "today") return timing === "today";
  if (filter === "overdue") return timing === "overdue";
  if (filter === "none") return !lead.nextFollowUpAt;
  return timing === "overdue" || timing === "today" || (!lead.nextFollowUpAt && lead.status === "New");
}
