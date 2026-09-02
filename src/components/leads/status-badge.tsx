import type { LeadStatus } from "./types";

const styles: Record<LeadStatus, string> = {
  New: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Contacted: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Opportunity: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Lost: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>{status}</span>;
}
