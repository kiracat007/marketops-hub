import type { CampaignStatus } from "./types";

const styles: Record<CampaignStatus, string> = {
  Planning: "border-[#d7d5cf] bg-[#efeee9] text-[#66645f]",
  Active: "border-[#cfc4f7] bg-[#eeeafd] text-[#5b4b91]",
  Completed: "border-[#bdcdc3] bg-[#e8efea] text-[#405c49]",
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}>{status}</span>;
}
