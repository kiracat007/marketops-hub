"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { initialActivities } from "@/components/activities/mock-data";
import { ActivityStatusBadge } from "@/components/activities/status-badge";
import { initialCampaigns } from "@/components/campaigns/mock-data";
import { StatusBadge as CampaignStatusBadge } from "@/components/campaigns/status-badge";
import { initialLeads } from "@/components/leads/mock-data";
import { LeadStatusBadge } from "@/components/leads/status-badge";
import { fetchLeadsFromSupabase } from "@/components/leads/supabase-data";
import type { LeadRecord } from "@/components/leads/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const campaign = initialCampaigns.find((item) => String(item.id) === id);
  const [supabaseLeads, setSupabaseLeads] = useState<LeadRecord[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(Boolean(campaign));
  const [leadsError, setLeadsError] = useState("");

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    fetchLeadsFromSupabase()
      .then((leads) => { if (active) setSupabaseLeads(leads); })
      .catch(() => { if (active) { setSupabaseLeads(initialLeads); setLeadsError("无法从 Supabase 读取 Related Leads，当前显示本地示例数据。"); } })
      .finally(() => { if (active) setLeadsLoading(false); });
    return () => { active = false; };
  }, [campaign]);

  if (!campaign) {
    return (
      <AppShell eyebrow="Campaigns" title="Campaign Not Found" description="没有找到这个 Campaign，它可能不存在或链接不正确。">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-950">无法找到 Campaign</p>
          <p className="mt-2 text-sm text-slate-500">请返回 Campaigns 列表并选择一个有效项目。</p>
          <Link href="/campaigns" className="mt-6 inline-flex rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700">返回 Campaigns</Link>
        </div>
      </AppShell>
    );
  }

  const relatedActivities = initialActivities.filter((activity) => activity.campaign === campaign.name);
  const relatedLeads = supabaseLeads.filter((lead) => lead.campaign === campaign.name);
  const wonLeads = relatedLeads.filter((lead) => lead.status === "Won").length;
  const totalPotentialValue = relatedLeads.reduce((total, lead) => total + lead.potentialValue, 0);
  const completionRate = campaign.targetLeads > 0 ? Math.round((campaign.actualLeads / campaign.targetLeads) * 100) : 0;
  const progressWidth = Math.min(completionRate, 100);

  return (
    <AppShell eyebrow="Campaign Detail" title={campaign.name} description="查看 Campaign 的计划、执行进度及相关市场活动和潜在线索。">
      <Link href="/campaigns" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700">← 返回 Campaigns</Link>

      {leadsError && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800" role="alert">{leadsError}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Campaign 汇总">
        <SummaryCard label="Related Activities" value={String(relatedActivities.length)} />
        <SummaryCard label="Related Leads" value={leadsLoading ? "加载中..." : String(relatedLeads.length)} />
        <SummaryCard label="Won Leads" value={leadsLoading ? "加载中..." : String(wonLeads)} />
        <SummaryCard label="Total Potential Value" value={leadsLoading ? "加载中..." : currency.format(totalPotentialValue)} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">基本信息</h2>
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <InfoItem label="Campaign Name" value={campaign.name} />
            <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt><dd className="mt-2"><CampaignStatusBadge status={campaign.status} /></dd></div>
            <InfoItem label="Channel" value={campaign.channel} />
            <InfoItem label="Owner" value={campaign.owner} />
            <InfoItem label="Budget" value={currency.format(campaign.budget)} />
            <InfoItem label="Start Date" value={formatDate(campaign.startDate)} />
            <InfoItem label="End Date" value={formatDate(campaign.endDate)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Performance</h2>
          <div className="mt-6 flex items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Lead 完成进度</p><p className="mt-1 text-3xl font-semibold text-slate-950">{completionRate}%</p></div><p className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{campaign.actualLeads}</span> / {campaign.targetLeads}</p></div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Lead 完成率" aria-valuenow={progressWidth} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progressWidth}%` }} /></div>
          <dl className="mt-6 grid grid-cols-2 gap-4"><InfoItem label="Target Leads" value={String(campaign.targetLeads)} /><InfoItem label="Actual Leads" value={String(campaign.actualLeads)} /></dl>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-lg font-semibold text-slate-950">Related Activities</h2><p className="mt-1 text-sm text-slate-500">与这个 Campaign 关联的具体市场活动。</p></div>
        {relatedActivities.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3.5 font-semibold">Activity Name</th><th className="px-4 py-3.5 font-semibold">Type</th><th className="px-4 py-3.5 font-semibold">Date</th><th className="px-4 py-3.5 font-semibold">Location</th><th className="px-6 py-3.5 font-semibold">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{relatedActivities.map((activity) => <tr key={activity.id}><td className="px-6 py-4 font-medium text-slate-950">{activity.name}</td><td className="px-4 py-4 text-slate-600">{activity.type}</td><td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(activity.startDate)}</td><td className="px-4 py-4 text-slate-600">{activity.location}</td><td className="px-6 py-4"><ActivityStatusBadge status={activity.status} /></td></tr>)}</tbody></table></div> : <EmptyRelated label="Activity" />}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5"><h2 className="text-lg font-semibold text-slate-950">Related Leads</h2><p className="mt-1 text-sm text-slate-500">Supabase 中归属于这个 Campaign 的 Leads。</p></div>
        {leadsLoading ? <div className="px-6 py-10 text-center text-sm font-medium text-slate-500">正在从 Supabase 加载 Related Leads...</div> : relatedLeads.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3.5 font-semibold">Name</th><th className="px-4 py-3.5 font-semibold">Company</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-6 py-3.5 text-right font-semibold">Potential Value</th></tr></thead><tbody className="divide-y divide-slate-100">{relatedLeads.map((lead) => <tr key={lead.id}><td className="px-6 py-4 font-medium text-slate-950">{lead.name}</td><td className="px-4 py-4 text-slate-600">{lead.company}</td><td className="px-4 py-4"><LeadStatusBadge status={lead.status} /></td><td className="px-6 py-4 text-right tabular-nums text-slate-700">{currency.format(lead.potentialValue)}</td></tr>)}</tbody></table></div> : <EmptyRelated label="Lead" />}
      </section>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p></div>;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1.5 font-medium text-slate-900">{value}</dd></div>;
}

function EmptyRelated({ label }: { label: string }) {
  return <div className="px-6 py-10 text-center text-sm text-slate-500">当前没有关联的 {label}。</div>;
}
