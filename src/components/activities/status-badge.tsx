import type { ActivityStatus } from "./types";

const styles: Record<ActivityStatus, string> = {
  Planning: "border-[#d7d5cf] bg-[#efeee9] text-[#66645f]",
  Confirmed: "border-[#cfc4f7] bg-[#eeeafd] text-[#5b4b91]",
  Completed: "border-[#bdcdc3] bg-[#e8efea] text-[#405c49]",
  Cancelled: "border-[#ddc9c6] bg-[#f3eae8] text-[#805751]",
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}>{status}</span>;
}
