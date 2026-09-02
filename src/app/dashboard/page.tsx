import { AppShell } from "@/components/app-shell";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export default function DashboardPage() {
  return (
    <AppShell eyebrow="Dashboard" title="概览" description="快速查看市场运营的整体状态、线索结果和近期工作。">
      <DashboardOverview />
    </AppShell>
  );
}
