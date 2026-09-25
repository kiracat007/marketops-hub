import type { OpportunityStage } from "./types";

const styles: Record<OpportunityStage, string> = {
  Discovery: "bg-zinc-100 text-zinc-600",
  Proposal: "bg-violet-50 text-violet-700",
  Negotiation: "bg-purple-100/70 text-purple-800",
  Won: "bg-emerald-50 text-emerald-700",
  Lost: "bg-rose-50 text-rose-700",
};

export function OpportunityStatusBadge({ stage }: { stage: OpportunityStage }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[stage]}`}>{stage}</span>;
}
