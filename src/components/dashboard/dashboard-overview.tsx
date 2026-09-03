import { initialActivities } from "@/components/activities/mock-data";
import { ActivityStatusBadge } from "@/components/activities/status-badge";
import { initialCampaigns } from "@/components/campaigns/mock-data";
import { initialLeads } from "@/components/leads/mock-data";
import { LeadStatusBadge } from "@/components/leads/status-badge";
import { leadSources, leadStatuses } from "@/components/leads/types";
import { initialPartners } from "@/components/partners/mock-data";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", timeZone: "UTC" });
const editorialDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const today = "2026-09-02";

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function DashboardOverview() {
  const activeCampaigns = initialCampaigns.filter((item) => item.status === "Active").length;
  const upcomingActivities = initialActivities
    .filter((item) => item.startDate >= today && item.status !== "Completed" && item.status !== "Cancelled")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const wonLeads = initialLeads.filter((item) => item.status === "Won").length;
  const totalPotentialValue = initialLeads.reduce((sum, item) => sum + item.potentialValue, 0);
  const funnel = leadStatuses.map((status) => ({ status, count: initialLeads.filter((item) => item.status === status).length }));
  const sources = leadSources.map((source) => ({ source, count: initialLeads.filter((item) => item.source === source).length }));
  const funnelMax = Math.max(...funnel.map((item) => item.count), 1);
  const sourceMax = Math.max(...sources.map((item) => item.count), 1);
  const recentLeads = [...initialLeads].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id).slice(0, 5);
  const nextActivity = upcomingActivities[0];
  const kpis = [
    { label: "Total Potential Value", value: compactCurrency.format(totalPotentialValue), note: currency.format(totalPotentialValue), feature: true },
    { label: "Next Activity", value: nextActivity ? editorialDateFormatter.format(new Date(`${nextActivity.startDate}T00:00:00Z`)).toUpperCase() : "—", note: nextActivity ? `${nextActivity.name} · ${upcomingActivities.length} upcoming` : "No upcoming activity", feature: true },
    { label: "Active Campaigns", value: activeCampaigns.toString().padStart(2, "0"), note: "正在执行的营销项目" },
    { label: "Total Leads", value: initialLeads.length.toString().padStart(2, "0"), note: "当前全部潜在线索" },
    { label: "Won Leads", value: wonLeads.toString().padStart(2, "0"), note: "已经成功转化的线索" },
    { label: "Total Partners", value: initialPartners.length.toString().padStart(2, "0"), note: "全部外部合作伙伴" },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-px overflow-hidden rounded-[16px] border border-[#dddcd7] bg-[#dddcd7] sm:grid-cols-2 xl:grid-cols-4" aria-label="关键指标">
        {kpis.map((item, index) => (
          <article key={item.label} className={`${item.feature ? "bg-[#e9e3fb]" : "bg-[#faf9f6]"} p-7 sm:p-8 ${index < 2 ? "xl:col-span-2" : ""}`}>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#6f6f6b]">{item.label}</p>
            <p className={`mt-8 font-bold leading-none tracking-[-0.055em] text-[#111111] ${item.feature ? "text-[46px] sm:text-[58px]" : "text-[40px] sm:text-[48px]"}`}>{item.value}</p>
            <p className="mt-4 max-w-sm text-[12px] leading-5 text-[#6f6f6b]">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[14px] border border-[#dddcd7] bg-[#faf9f6] p-7 shadow-sm">
          <h2 className="text-[15px] font-medium text-zinc-950">Lead Funnel</h2>
          <p className="mt-1 text-sm text-slate-500">各阶段当前拥有的线索数量</p>
          <div className="mt-6 space-y-4">
            {funnel.map((item, index) => (
              <div key={item.status}>
                <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-700">{item.status}</span><span className="font-semibold tabular-nums text-slate-950">{item.count}</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e5df]"><div className="h-full rounded-full bg-[#a997f0]" style={{ width: `${Math.max((item.count / funnelMax) * 100 - index * 3, item.count ? 14 : 0)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[14px] border border-[#dddcd7] bg-[#faf9f6] p-7 shadow-sm">
          <h2 className="text-[15px] font-medium text-zinc-950">Lead Source Breakdown</h2>
          <p className="mt-1 text-sm text-slate-500">不同市场来源带来的线索数量</p>
          <div className="mt-6 space-y-3.5">
            {sources.map((item) => (
              <div key={item.source} className="grid grid-cols-[90px_1fr_24px] items-center gap-3 text-sm">
                <span className="text-slate-600">{item.source}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e5df]"><div className="h-full rounded-full bg-[#77746f]" style={{ width: `${(item.count / sourceMax) * 100}%` }} /></div>
                <span className="text-right font-semibold tabular-nums text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[14px] border border-[#dddcd7] bg-[#faf9f6] p-7 shadow-sm">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#77746f]">Performance</p>
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#111111]">Campaign Performance</h2>
        <p className="mt-1 text-sm text-slate-500">目标 Leads 与实际 Leads 的完成情况</p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {initialCampaigns.map((campaign) => {
            const rate = campaign.targetLeads === 0 ? 0 : Math.round((campaign.actualLeads / campaign.targetLeads) * 100);
            return <div key={campaign.id} className="min-w-0 border-t border-[#e3e1dc] py-5 first:border-t-0 lg:first:border-t">
              <div className="flex items-start justify-between gap-4"><p className="truncate text-sm font-medium text-slate-900">{campaign.name}</p><span className="shrink-0 text-xl font-bold tracking-[-0.04em] text-[#594b85]">{rate}%</span></div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e7e5df]"><div className="h-full rounded-full bg-[#a997f0]" style={{ width: `${Math.min(rate, 100)}%` }} /></div>
              <p className="mt-2 text-xs text-slate-500">{campaign.actualLeads} 实际 / {campaign.targetLeads} 目标 Leads</p>
            </div>;
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-[14px] border border-[#dddcd7] bg-[#faf9f6] shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-950">Upcoming Activities</h2><p className="mt-1 text-sm text-slate-500">接下来最早发生的 5 个活动</p></div>
          <div className="divide-y divide-slate-100">{upcomingActivities.slice(0, 5).map((activity) => <div key={activity.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-medium text-slate-900">{activity.name}</p><p className="mt-1 text-sm text-slate-500">{activity.type} · {activity.location}</p></div><ActivityStatusBadge status={activity.status} /></div>
            <p className="mt-3 text-lg font-bold uppercase tracking-[-0.025em] text-[#594b85]">{formatDate(activity.startDate)}</p>
          </div>)}</div>
        </article>

        <article className="overflow-hidden rounded-[14px] border border-[#dddcd7] bg-[#faf9f6] shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-950">Recent Leads</h2><p className="mt-1 text-sm text-slate-500">最近创建的 5 条潜在线索</p></div>
          <div className="divide-y divide-slate-100">{recentLeads.map((lead) => <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="min-w-0"><p className="font-medium text-slate-900">{lead.name} <span className="font-normal text-slate-400">·</span> {lead.company}</p><p className="mt-1 text-sm text-slate-500">{lead.source} · {currency.format(lead.potentialValue)}</p></div><LeadStatusBadge status={lead.status} />
          </div>)}</div>
        </article>
      </section>
    </div>
  );
}
