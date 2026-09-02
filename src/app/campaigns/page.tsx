import { AppShell } from "@/components/app-shell";
import { CampaignsManager } from "@/components/campaigns/campaigns-manager";

export default function CampaignsPage() {
  return (
    <AppShell
      eyebrow="Campaigns"
      title="营销项目"
      description="规划、跟踪并管理品牌 Campaign 和产品推广 Campaign。"
    >
      <CampaignsManager />
    </AppShell>
  );
}
