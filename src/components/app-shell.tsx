"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDays,
  BriefcaseBusiness,
  ContactRound,
  Handshake,
  History,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

const navigation: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Partners", href: "/partners", icon: Handshake },
  { label: "Activities", href: "/activities", icon: CalendarDays },
  { label: "Leads", href: "/leads", icon: ContactRound },
  { label: "Opportunities", href: "/opportunities", icon: BriefcaseBusiness },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Activity Log", href: "/activity-log", icon: History },
];

type AppShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({ eyebrow, title, description, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#111111] lg:grid lg:grid-cols-[228px_1fr]">
      <aside className="border-b border-[#e5e1db] bg-[#fdfcf9] text-[#111111] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 px-5 lg:h-[76px]">
          <div className="grid size-8 place-items-center rounded-[9px] bg-[#111111] text-xs font-semibold text-white">M</div>
          <div>
            <p className="text-sm font-semibold tracking-[-0.01em]">MarketOps Hub</p>
            <p className="mt-0.5 text-[11px] text-[#8a8984]">Marketing workspace</p>
          </div>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3 max-[479px]:justify-between lg:flex-col lg:py-4" aria-label="主要导航">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={`group flex shrink-0 items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors max-[479px]:size-10 max-[479px]:justify-center max-[479px]:p-0 ${isActive ? "bg-[#f0ebff] font-medium text-[#352c50]" : "text-[#706d68] hover:bg-[#f5f2ed] hover:text-[#111111]"}`}
              >
                <Icon
                  aria-hidden="true"
                  className={`size-[19px] shrink-0 transition-colors ${isActive ? "text-[#7459c5]" : "text-[#918d87] group-hover:text-[#44413d]"}`}
                  strokeWidth={1.7}
                />
                <span className="max-[479px]:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-[#e5e1db] bg-[#faf8f5] px-5 py-9 sm:px-8 lg:px-12 lg:py-11">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#77746f]">{eyebrow}</p>
          <h1 className="mt-4 text-[32px] font-bold tracking-[-0.045em] text-[#111111] sm:text-[42px]">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f6f6b] sm:text-[15px]">{description}</p>
        </header>
        <div className="mx-auto w-full max-w-[1440px] p-5 sm:p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
