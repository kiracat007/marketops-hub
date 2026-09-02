import { AppShell } from "@/components/app-shell";
import { LeadsManager } from "@/components/leads/leads-manager";

export default function LeadsPage() {
  return (
    <AppShell eyebrow="Leads" title="潜在线索" description="管理市场工作带来的潜在线索，并跟踪从 New 到 Won 或 Lost 的状态。">
      <LeadsManager />
    </AppShell>
  );
}
