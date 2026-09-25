import type { PartnerStatus } from "./types";

const styles: Record<PartnerStatus, string> = {
  Prospect: "border-[#d7d5cf] bg-[#efeee9] text-[#66645f]",
  Active: "border-[#cfc4f7] bg-[#eeeafd] text-[#5b4b91]",
  Inactive: "border-[#d7d5cf] bg-[#efeee9] text-[#77746e]",
};

export function PartnerStatusBadge({ status }: { status: PartnerStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}>{status}</span>;
}
