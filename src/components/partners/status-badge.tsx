import type { PartnerStatus } from "./types";

const styles: Record<PartnerStatus, string> = {
  Prospect: "bg-violet-50 text-violet-700 ring-violet-600/20",
  Contacted: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function PartnerStatusBadge({ status }: { status: PartnerStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>{status}</span>;
}
