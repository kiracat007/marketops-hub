import type { ActivityLogType } from "./types";

const styles: Record<ActivityLogType, string> = {
  Created: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Updated: "bg-sky-50 text-sky-700 ring-sky-600/20",
  "Status Changed": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Deleted: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function ActivityLogTypeBadge({ type }: { type: ActivityLogType }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[type]}`}>{type}</span>;
}
