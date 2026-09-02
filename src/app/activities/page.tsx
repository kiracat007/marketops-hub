import { AppShell } from "@/components/app-shell";
import { ActivitiesManager } from "@/components/activities/activities-manager";

export default function ActivitiesPage() {
  return (
    <AppShell eyebrow="Activities" title="具体活动" description="管理具体市场活动，并查看它们关联的 Campaign 和 Partner。">
      <ActivitiesManager />
    </AppShell>
  );
}
