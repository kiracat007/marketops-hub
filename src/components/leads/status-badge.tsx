import type { LeadStatus } from "./types";

const styles: Record<LeadStatus, string> = {
  New: "border-[#d7d5cf] bg-[#efeee9] text-[#66645f]",
  Contacted: "border-[#d8cff7] bg-[#f2effd] text-[#665a8f]",
  Qualified: "border-[#cfc4f7] bg-[#eeeafd] text-[#5b4b91]",
  Opportunity: "border-[#c8bee9] bg-[#e9e4f8] text-[#594c80]",
  Won: "border-[#bdcdc3] bg-[#e8efea] text-[#405c49]",
  Lost: "border-[#ddc9c6] bg-[#f3eae8] text-[#805751]",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}>{status}</span>;
}
