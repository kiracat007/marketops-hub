"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", mark: "D" },
  { label: "Campaigns", href: "/campaigns", mark: "C" },
  { label: "Partners", href: "/partners", mark: "P" },
  { label: "Activities", href: "/activities", mark: "A" },
  { label: "Leads", href: "/leads", mark: "L" },
  { label: "Activity Log", href: "/activity-log", mark: "AL" },
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
    <div className="min-h-screen bg-[#f5f4f0] text-[#111111] lg:grid lg:grid-cols-[228px_1fr]">
      <aside className="border-b border-[#dddcd7] bg-[#faf9f6] text-[#111111] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 px-5 lg:h-[76px]">
          <div className="grid size-8 place-items-center rounded-[9px] bg-[#111111] text-xs font-semibold text-white">M</div>
          <div>
            <p className="text-sm font-semibold tracking-[-0.01em]">MarketOps Hub</p>
            <p className="mt-0.5 text-[11px] text-[#8a8984]">Marketing workspace</p>
          </div>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto px-3 pb-3 lg:flex-col lg:py-4" aria-label="主要导航">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "bg-[#eeeafd] font-medium text-[#272331]" : "text-[#6f6f6b] hover:bg-[#f3f1ec] hover:text-[#111111]"}`}
            >
              <span className={`grid size-6 place-items-center rounded-md border text-[10px] font-medium ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "border-[#cfc4f7] bg-[#f8f6ff] text-[#5b4b91]" : "border-[#dddcd7] text-[#918f89]"}`}>{item.mark}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-[#dddcd7] bg-[#f8f7f3] px-5 py-9 sm:px-8 lg:px-12 lg:py-14">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#77746f]">{eyebrow}</p>
          <h1 className="mt-4 text-[32px] font-bold tracking-[-0.045em] text-[#111111] sm:text-[42px]">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f6f6b] sm:text-[15px]">{description}</p>
        </header>
        <div className="mx-auto w-full max-w-[1440px] p-5 sm:p-8 lg:p-12">{children}</div>
      </main>
    </div>
  );
}
