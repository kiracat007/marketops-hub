import { ActivityLogManager } from "@/components/activity-log/activity-log-manager";
import { AppShell } from "@/components/app-shell";

export default function ActivityLogPage() {
  return (
    <AppShell eyebrow="Activity Log" title="活动记录" description="查看 MarketOps Hub 最近发生的业务操作和状态变化。">
      <ActivityLogManager />
    </AppShell>
  );
}
