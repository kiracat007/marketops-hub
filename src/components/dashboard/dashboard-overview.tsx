"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initialActivities } from "@/components/activities/mock-data";
import { ActivityStatusBadge } from "@/components/activities/status-badge";
import { initialCampaigns } from "@/components/campaigns/mock-data";
import { initialLeads } from "@/components/leads/mock-data";
import { LeadStatusBadge } from "@/components/leads/status-badge";
import { leadSources, leadStatuses } from "@/components/leads/types";
import { initialPartners } from "@/components/partners/mock-data";
import { fetchCampaigns } from "@/components/campaigns/supabase-data";
import { fetchActivities } from "@/components/activities/supabase-data";
import { fetchLeadsFromSupabase } from "@/components/leads/supabase-data";
import { fetchPartners } from "@/components/partners/supabase-data";
import { fetchOpportunities } from "@/components/opportunities/supabase-data";
import type { Campaign } from "@/components/campaigns/types";
import type { Activity } from "@/components/activities/types";
import type { LeadRecord } from "@/components/leads/types";
import type { Partner } from "@/components/partners/types";
import type { Opportunity } from "@/components/opportunities/types";
import { calculatePipelineSummary } from "@/components/opportunities/logic";
import { fetchTasks } from "@/components/tasks/supabase-data";
import type { Task } from "@/components/tasks/types";
import { getTaskDueCategory } from "@/components/tasks/logic";
import { getFollowUpTiming } from "@/components/leads/follow-up";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compactCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", timeZone: "UTC" });
const editorialDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function DashboardOverview() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => { let active = true; Promise.all([fetchCampaigns(), fetchActivities(), fetchLeadsFromSupabase(), fetchPartners(), fetchOpportunities()]).then(([c, a, l, p, o]) => { if (active) { setCampaigns(c); setActivities(a); setLeads(l); setPartners(p); setOpportunities(o); } }).catch(() => { if (active) { setCampaigns(initialCampaigns); setActivities(initialActivities); setLeads(initialLeads); setPartners(initialPartners); setOpportunities([]); } }); return () => { active = false; }; }, []);
  useEffect(() => { let active=true; fetchTasks().then((items)=>{if(active)setTasks(items);}).catch(()=>{if(active)setTasks([]);}); return()=>{active=false;}; },[]);
  const activeCampaigns = campaigns.filter((item) => item.status === "Active").length;
  const upcomingActivities = activities
    .filter((item) => item.startDate >= today && item.status !== "Completed" && item.status !== "Cancelled")
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const pipeline = calculatePipelineSummary(opportunities);
  const funnel = leadStatuses.map((status) => ({ status, count: leads.filter((item) => item.status === status).length }));
  const sources = leadSources.map((source) => ({ source, count: leads.filter((item) => item.source === source).length }));
  const funnelMax = Math.max(...funnel.map((item) => item.count), 1);
  const sourceMax = Math.max(...sources.map((item) => item.count), 1);
  const recentLeads = [...leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || String(b.id).localeCompare(String(a.id))).slice(0, 5);
  const nextActivity = upcomingActivities[0];
  const kpis = [
    { label: "Open Pipeline", value: compactCurrency.format(pipeline.openPipeline), note: currency.format(pipeline.openPipeline), feature: true },
    { label: "Next Activity", value: nextActivity ? editorialDateFormatter.format(new Date(`${nextActivity.startDate}T00:00:00Z`)).toUpperCase() : "—", note: nextActivity ? `${nextActivity.name} · ${upcomingActivities.length} upcoming` : "No upcoming activity", feature: true },
    { label: "Won Revenue", value: compactCurrency.format(pipeline.wonRevenue), note: "已赢得商机的总价值" },
    { label: "Open Opportunities", value: pipeline.openOpportunities.toString().padStart(2, "0"), note: "Discovery、Proposal 或 Negotiation" },
    { label: "Active Campaigns", value: activeCampaigns.toString().padStart(2, "0"), note: "正在执行的营销项目" },
    { label: "Total Partners", value: partners.length.toString().padStart(2, "0"), note: "全部外部合作伙伴" },
  ];
  const overdueFollowUps=leads.filter((lead)=>getFollowUpTiming(lead.nextFollowUpAt,lead.followUpStatus,now)==="overdue").length;
  const dueTodayTasks=tasks.filter((task)=>getTaskDueCategory(task,now)==="today").length;
  const leadsWithoutFollowUp=leads.filter((lead)=>lead.status==="New"&&!lead.nextFollowUpAt).length;

  return (
    <div className="space-y-12 lg:space-y-16">
      <section className="overflow-hidden rounded-[18px] border border-[#e4e0da] bg-[#fdfcf9] shadow-[0_1px_2px_rgba(17,17,17,0.025)]" aria-label="关键指标">
        <div className="relative grid min-h-[360px] lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative z-10 flex flex-col justify-center px-7 py-12 sm:px-10 lg:px-12 lg:py-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#77736d]">{kpis[0].label}</p>
            <p className="metric-value mt-6 whitespace-nowrap text-[48px] text-[#111111] sm:text-[58px] lg:text-[68px]">{kpis[0].value}</p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#6b6863]">{kpis[0].note}</p>
          </div>

          <div className="relative flex min-h-[250px] items-end overflow-hidden border-t border-[#e4e0da] bg-[#f1edfd] p-7 sm:p-10 lg:min-h-0 lg:border-l lg:border-t-0">
            <div aria-hidden="true" className="absolute -right-16 -top-20 size-64 rounded-full border border-[#cfc5ee]/65" />
            <div aria-hidden="true" className="absolute -right-7 -top-11 size-48 rounded-full border border-[#d9d0f3]" />
            <div aria-hidden="true" className="absolute right-8 top-10 size-28 rounded-full bg-[#b7a4ef]/55" />
            <div aria-hidden="true" className="absolute right-5 top-1/2 grid grid-cols-5 gap-3 opacity-45">
              {Array.from({ length: 20 }).map((_, index) => <span key={index} className="size-1 rounded-full bg-[#8067ce]" />)}
            </div>
            <div className="relative z-10 max-w-xs">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#695d89]">{kpis[1].label}</p>
              <p className="editorial-date mt-5 whitespace-nowrap text-[40px] text-[#332a4d] sm:text-[48px] lg:text-[54px]">{kpis[1].value}</p>
              <p className="mt-4 text-sm leading-6 text-[#685f7e]">{kpis[1].note}</p>
            </div>
          </div>
        </div>

        <div className="grid border-t border-[#e4e0da] sm:grid-cols-2 lg:grid-cols-4">
          {kpis.slice(2).map((item) => (
            <article key={item.label} className="border-b border-[#e4e0da] px-7 py-8 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#77736d]">{item.label}</p>
              <p className="metric-value mt-5 whitespace-nowrap text-[34px] text-[#171615] sm:text-[40px]">{item.value}</p>
              <p className="mt-4 text-[11px] leading-5 text-[#7c7973]">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-[#ddd5f1] bg-[#f3effc] p-6 sm:p-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#695d89]">Action Center</p><h2 className="mt-3 text-xl font-semibold text-[#2d2740]">Needs Attention</h2><p className="mt-2 text-sm text-[#756c8a]">The next follow-ups and tasks that need action now.</p>
        <div className="mt-7 grid gap-px overflow-hidden rounded-[12px] border border-[#dcd2f3] bg-[#dcd2f3] sm:grid-cols-3">
          <Link href="/leads?followup=overdue" className="bg-[#faf8ff] p-5 transition hover:bg-white"><p className="metric-value text-[32px] text-[#4f3b89]">{overdueFollowUps}</p><p className="mt-2 text-sm text-[#675f78]">overdue follow-ups</p></Link>
          <Link href="/tasks?due=today" className="bg-[#faf8ff] p-5 transition hover:bg-white"><p className="metric-value text-[32px] text-[#4f3b89]">{dueTodayTasks}</p><p className="mt-2 text-sm text-[#675f78]">tasks due today</p></Link>
          <Link href="/leads?followup=none" className="bg-[#faf8ff] p-5 transition hover:bg-white"><p className="metric-value text-[32px] text-[#4f3b89]">{leadsWithoutFollowUp}</p><p className="mt-2 text-sm text-[#675f78]">new leads without follow-up</p></Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <article className="rounded-[16px] border border-[#e4e0da] bg-[#fdfcf9] p-6 shadow-[0_1px_2px_rgba(17,17,17,0.025)] sm:p-8">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#77736d]">Performance</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#151412]">Campaign Performance</h2>
          <p className="mt-2 text-sm text-[#77736d]">目标 Leads 与实际 Leads 的完成情况</p>
          <div className="mt-8 grid gap-x-8 lg:grid-cols-2">
            {campaigns.map((campaign) => {
              const actualLeads = leads.filter((lead) => lead.campaignId === String(campaign.id) || (!lead.campaignId && lead.campaign === campaign.name)).length;
              const rate = campaign.targetLeads === 0 ? 0 : Math.round((actualLeads / campaign.targetLeads) * 100);
              return <div key={campaign.id} className="min-w-0 border-t border-[#e9e5df] py-5">
                <div className="flex items-start justify-between gap-5"><p className="truncate text-sm font-medium text-[#292724]">{campaign.name}</p><span className="font-display shrink-0 text-[22px] leading-none text-[#6d54ba]">{rate}%</span></div>
                <div className="mt-4 h-px overflow-hidden bg-[#dedad4]"><div className="h-full bg-[#8b6fe8]" style={{ width: `${Math.min(rate, 100)}%` }} /></div>
                <p className="mt-3 text-[11px] text-[#85817b]">{actualLeads} actual · {campaign.targetLeads} target leads</p>
              </div>;
            })}
          </div>
        </article>

        <article className="overflow-hidden rounded-[16px] border border-[#ddd5f1] bg-[#f2edfd] shadow-[0_1px_2px_rgba(17,17,17,0.025)]">
          <div className="px-6 pb-5 pt-7 sm:px-8"><p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#695d89]">Schedule</p><h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#2d2740]">Upcoming Activities</h2><p className="mt-2 text-sm text-[#756c8a]">接下来最早发生的 5 个活动</p></div>
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">{upcomingActivities.slice(0, 5).map((activity, index) => <div key={activity.id} className="border-t border-[#dcd2f3] py-5 first:border-t-0 first:pb-7 first:pt-2">
            <div className={`grid gap-3 ${index === 0 ? "" : "grid-cols-[72px_1fr] items-start"}`}>
              <p className={`editorial-date ${index === 0 ? "text-[38px] sm:text-[42px]" : "text-lg"} whitespace-nowrap uppercase text-[#6d54ba]`}>{formatDate(activity.startDate)}</p>
              <div className={index === 0 ? "mt-4" : ""}><div className="flex flex-wrap items-start justify-between gap-2"><p className="font-medium text-[#272235]">{activity.name}</p><ActivityStatusBadge status={activity.status} /></div><p className="mt-1.5 text-xs leading-5 text-[#756c8a]">{activity.type} · {activity.location}</p></div>
            </div>
          </div>)}</div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-[16px] border border-[#e4e0da] bg-[#fdfcf9] shadow-[0_1px_2px_rgba(17,17,17,0.025)]">
          <div className="border-b border-[#e9e5df] px-6 py-6 sm:px-8"><p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#77736d]">Latest records</p><h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#151412]">Recent Leads</h2><p className="mt-2 text-sm text-[#77736d]">最近创建的 5 条潜在线索</p></div>
          <div>{recentLeads.map((lead) => <div key={lead.id} className="grid gap-3 border-b border-[#eeeae4] px-6 py-5 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-8">
            <div className="min-w-0"><p className="font-medium text-[#292724]">{lead.name} <span className="font-normal text-[#aaa59e]">·</span> {lead.company}</p><p className="mt-1 text-xs text-[#85817b]">{lead.source}</p></div><p className="text-base font-semibold tabular-nums tracking-[-0.02em] text-[#24211f]">{currency.format(lead.potentialValue)}</p><LeadStatusBadge status={lead.status} />
          </div>)}</div>
        </article>

        <article className="rounded-[16px] border border-[#e4e0da] bg-[#fdfcf9] p-6 shadow-[0_1px_2px_rgba(17,17,17,0.025)] sm:p-8">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#77736d]">Acquisition</p>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#151412]">Lead Sources</h2>
          <div className="mt-7 flex items-end justify-between border-b border-[#e9e5df] pb-7"><div><p className="metric-value text-[40px] text-[#171615]">{leads.length}</p><p className="mt-3 text-xs text-[#85817b]">Total Leads</p></div><div aria-hidden="true" className="size-16 rounded-full border-[12px] border-[#d8cff5] border-r-[#8268d4]" /></div>
          <div className="mt-6 space-y-4">
            {sources.map((item) => (
              <div key={item.source} className="grid grid-cols-[88px_1fr_24px] items-center gap-3 text-xs">
                <span className="text-[#6f6b65]">{item.source}</span>
                <div className="h-1 overflow-hidden rounded-full bg-[#e9e5df]"><div className="h-full rounded-full bg-[#9a82e2]" style={{ width: `${(item.count / sourceMax) * 100}%` }} /></div>
                <span className="text-right font-semibold tabular-nums text-[#292724]">{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="border-y border-[#e4e0da] py-8">
        <div className="mb-8 sm:flex sm:items-end sm:justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#77736d]">Pipeline</p><h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#151412]">Lead Funnel</h2></div><p className="mt-2 text-sm text-[#77736d] sm:mt-0">各阶段当前拥有的线索数量</p></div>
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-6">
          {funnel.map((item, index) => (
            <div key={item.status}>
              <div className="flex items-end justify-between gap-3"><span className="text-xs font-medium text-[#65615c]">{item.status}</span><span className="text-2xl font-semibold tabular-nums tracking-[-0.04em] text-[#1d1b19]">{item.count}</span></div>
              <div className="mt-3 h-px overflow-hidden bg-[#dedad4]"><div className="h-full bg-[#8b6fe8]" style={{ width: `${Math.max((item.count / funnelMax) * 100 - index * 3, item.count ? 14 : 0)}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
