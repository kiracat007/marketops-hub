import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-16 items-center gap-3 px-5 lg:h-20">
          <div className="grid size-9 place-items-center rounded-xl bg-teal-400 font-bold text-slate-950">M</div>
          <div>
            <p className="font-semibold tracking-tight">MarketOps Hub</p>
            <p className="text-xs text-slate-400">市场运营中心</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:py-4" aria-label="主要导航">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-slate-800 text-xs text-teal-300">{item.mark}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-slate-200 bg-white px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
        </header>
        <div className="p-5 sm:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
