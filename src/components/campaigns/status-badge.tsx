import type { CampaignStatus } from "./types";

const styles: Record<CampaignStatus, string> = {
  Planning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>{status}</span>;
}
