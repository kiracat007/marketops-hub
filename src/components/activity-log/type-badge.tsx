import type { ActivityLogType } from "./types";

const styles: Record<ActivityLogType, string> = {
  Created: "border-[#bdcdc3] bg-[#e8efea] text-[#405c49]",
  Updated: "border-[#d8cff7] bg-[#f2effd] text-[#665a8f]",
  "Status Changed": "border-[#cfc4f7] bg-[#eeeafd] text-[#5b4b91]",
  Deleted: "border-[#ddc9c6] bg-[#f3eae8] text-[#805751]",
};

export function ActivityLogTypeBadge({ type }: { type: ActivityLogType }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[type]}`}>{type}</span>;
}
