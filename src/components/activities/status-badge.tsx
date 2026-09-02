import type { ActivityStatus } from "./types";

const styles: Record<ActivityStatus, string> = {
  Planning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Confirmed: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>{status}</span>;
}
