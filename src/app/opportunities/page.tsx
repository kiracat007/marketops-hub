import { AppShell } from "@/components/app-shell";
import { OpportunitiesManager } from "@/components/opportunities/opportunities-manager";

export default function OpportunitiesPage(){return <AppShell eyebrow="Pipeline" title="Opportunities" description="Track qualified deals from discovery to close."><OpportunitiesManager/></AppShell>;}
