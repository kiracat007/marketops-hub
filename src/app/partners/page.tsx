import { AppShell } from "@/components/app-shell";
import { PartnersManager } from "@/components/partners/partners-manager";

export default function PartnersPage() {
  return (
    <AppShell
      eyebrow="Partners"
      title="合作伙伴"
      description="集中管理 KOL、Agency、Dealer、Vendor 等外部市场合作伙伴。"
    >
      <PartnersManager />
    </AppShell>
  );
}
