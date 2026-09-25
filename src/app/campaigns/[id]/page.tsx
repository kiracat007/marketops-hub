"use client";

import Link from "next/link";
import { use, useEffect, useState, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { initialActivities } from "@/components/activities/mock-data";
import { ActivityStatusBadge } from "@/components/activities/status-badge";
import { initialCampaigns } from "@/components/campaigns/mock-data";
import { StatusBadge as CampaignStatusBadge } from "@/components/campaigns/status-badge";
import { initialLeads } from "@/components/leads/mock-data";
import { LeadStatusBadge } from "@/components/leads/status-badge";
import { fetchLeadsFromSupabase } from "@/components/leads/supabase-data";
import type { LeadRecord } from "@/components/leads/types";
import { fetchCampaign } from "@/components/campaigns/supabase-data";
import { fetchActivities } from "@/components/activities/supabase-data";
import { fetchOpportunities } from "@/components/opportunities/supabase-data";
import { attributedCampaignId, calculateActivityPerformance, calculateCampaignPerformance, calculateSourcePerformance, generateCampaignReportSummary, performanceHighlights } from "@/components/campaigns/performance";
import type { Campaign } from "@/components/campaigns/types";
import type { Activity } from "@/components/activities/types";
import type { Opportunity } from "@/components/opportunities/types";
import { OpportunityStatusBadge } from "@/components/opportunities/status-badge";
import { InsightPanel } from "@/components/ai/insight-panel";
import { fetchTasks } from "@/components/tasks/supabase-data";
import type { Task } from "@/components/tasks/types";
import { buildCampaignReviewContext } from "@/lib/ai/marketing-context";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
const formatDate = (value: string) => value ? dateFormatter.format(new Date(`${value}T00:00:00Z`)) : "—";
const formatPercent = (value: number | null) => value === null ? "—" : `${value.toFixed(1)}%`;
const formatRatio = (value: number | null) => value === null ? "—" : `${value.toFixed(2)}x`;

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const fallbackCampaign = initialCampaigns.find((item) => String(item.id) === id);
  const [campaign, setCampaign] = useState<Campaign | null>(fallbackCampaign ?? null);
  const [relatedActivities, setRelatedActivities] = useState<Activity[]>([]);
  const [supabaseLeads, setSupabaseLeads] = useState<LeadRecord[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCampaign(id), fetchActivities(id), fetchLeadsFromSupabase(), fetchOpportunities()])
      .then(([campaignRecord, activities, leads, allOpportunities]) => {
        if (!active) return;
        setCampaign(campaignRecord);
        setRelatedActivities(activities);
        setSupabaseLeads(leads.filter((lead) => lead.campaignId === id));
        setOpportunities(allOpportunities.filter((item) => attributedCampaignId(item, leads) === id));
      })
      .catch(() => {
        if (!active) return;
        if (fallbackCampaign) {
          setCampaign(fallbackCampaign);
          setRelatedActivities(initialActivities.filter((item) => item.campaign === fallbackCampaign.name));
          setSupabaseLeads(initialLeads.filter((lead) => lead.campaign === fallbackCampaign.name));
          setOpportunities([]);
          setLoadError("无法读取 Supabase 关系数据，当前显示本地示例数据；Revenue 与 ROI 不可用于正式判断。");
        } else setNotFound(true);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fallbackCampaign, id]);

  useEffect(() => {
    let active = true;
    fetchTasks().then((items) => { if (active) setTasks(items); }).catch(() => { if (active) setTasks([]); });
    return () => { active = false; };
  }, []);

  if (loading && !campaign) return <AppShell eyebrow="Campaign Detail" title="正在加载 Campaign..." description="正在从 Supabase 读取关联数据。"><div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">Loading...</div></AppShell>;
  if (!campaign || notFound) return <AppShell eyebrow="Campaigns" title="Campaign Not Found" description="没有找到这个 Campaign，它可能不存在或链接不正确。"><div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><p className="text-lg font-semibold text-slate-950">无法找到 Campaign</p><p className="mt-2 text-sm text-slate-500">请返回 Campaigns 列表并选择一个有效项目。</p><Link href="/campaigns" className="mt-6 inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white">返回 Campaigns</Link></div></AppShell>;

  const performance = calculateCampaignPerformance(supabaseLeads, opportunities, campaign.spend ?? 0, campaign.targetLeads);
  const activityRows = calculateActivityPerformance(relatedActivities, supabaseLeads, opportunities);
  const sourceRows = calculateSourcePerformance(supabaseLeads, opportunities);
  const highlights = performanceHighlights(campaign, performance, activityRows);
  const reportSummary = generateCampaignReportSummary(campaign, performance, activityRows);
  const progressWidth = Math.min(performance.targetLeadAttainment ?? 0, 100);
  const activitySpend = relatedActivities.reduce((sum, activity) => sum + (activity.spend ?? 0), 0);
  const aiContext = buildCampaignReviewContext(campaign, { activities: relatedActivities, leads: supabaseLeads, opportunities, tasks });

  function exportReportCsv() {
    if (!campaign) return;
    const rows = [["Metric", "Value"], ["Campaign", campaign.name], ["Period", `${campaign.startDate} - ${campaign.endDate}`], ["Budget", campaign.budget], ["Recorded Spend", performance.spend], ["Leads", performance.leads], ["Qualified Leads", performance.qualifiedLeads], ["Opportunities", performance.opportunities], ["Open Pipeline", performance.openPipeline], ["Won Revenue", performance.wonRevenue], ["CPL", performance.cpl ?? ""], ["ROI", performance.roi ?? ""], ["ROAS", performance.roas ?? ""], ["Win Rate", performance.winRate ?? ""], ["Summary", reportSummary]];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `marketops-campaign-report-${campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "campaign"}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  const kpis = [["Spend", currency.format(performance.spend)], ["Leads", performance.leads], ["Qualified Leads", performance.qualifiedLeads], ["Opportunities", performance.opportunities], ["Open Pipeline", currency.format(performance.openPipeline)], ["Won Revenue", currency.format(performance.wonRevenue)], ["CPL", performance.cpl === null ? "—" : currency.format(performance.cpl)], ["ROI", formatPercent(performance.roi)]] as const;

  return <AppShell eyebrow="Campaign Performance" title={campaign.name} description="从市场投入、Lead、Pipeline 到 Revenue 的 Single-touch 归因视图。">
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3"><Link href="/campaigns" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-950">← 返回 Campaigns</Link><button onClick={() => setReportOpen(true)} className="rounded-[10px] bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">Generate Report</button></div>
    {loadError && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800" role="alert">{loadError}</div>}

    <section className="grid gap-px overflow-hidden rounded-[16px] border border-[#dddcd7] bg-[#dddcd7] sm:grid-cols-2 xl:grid-cols-4" aria-label="Campaign Performance KPIs">{kpis.map(([label, value], index) => <SummaryCard key={label} label={label} value={String(value)} accent={index === 4 || index === 7} />)}</section>

    <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[14px] border border-[#dddcd7] bg-[#faf9f6] p-7 shadow-sm"><p className="section-label">Overview</p><h2 className="mt-2 text-xl font-semibold">基本信息</h2><dl className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2"><InfoItem label="Campaign Name" value={campaign.name} /><div><dt className="section-label">Status</dt><dd className="mt-2"><CampaignStatusBadge status={campaign.status} /></dd></div><InfoItem label="Channel" value={campaign.channel} /><InfoItem label="Owner" value={campaign.owner} /><InfoItem label="Budget" value={currency.format(campaign.budget)} emphasis /><InfoItem label="Recorded Spend" value={currency.format(performance.spend)} emphasis /><InfoItem label="Start Date" value={formatDate(campaign.startDate)} /><InfoItem label="End Date" value={formatDate(campaign.endDate)} /></dl></section>
      <section className="rounded-[14px] border border-[#cec3f3] bg-[#e9e3fb] p-7 shadow-sm"><p className="section-label text-[#675b86]">Performance</p><div className="mt-7 flex items-end justify-between gap-4"><div><p className="text-sm text-[#675f78]">Target Lead Attainment</p><p className="metric-value mt-4 text-[44px]">{formatPercent(performance.targetLeadAttainment)}</p></div><p className="text-sm text-[#675f78]"><span className="font-semibold text-[#17141e]">{performance.leads}</span> / {campaign.targetLeads}</p></div><div className="mt-7 h-2 overflow-hidden rounded-full bg-white/60"><div className="h-full rounded-full bg-[#6f5cae]" style={{ width: `${progressWidth}%` }} /></div><dl className="mt-7 grid grid-cols-2 gap-5"><InfoItem label="CPQL" value={performance.cpql === null ? "—" : currency.format(performance.cpql)} /><InfoItem label="Lead → Opportunity" value={formatPercent(performance.leadToOpportunityRate)} /><InfoItem label="Win Rate" value={formatPercent(performance.winRate)} /><InfoItem label="ROAS" value={formatRatio(performance.roas)} /></dl></section>
    </div>

    <section className="mt-8 rounded-[14px] border border-violet-100 bg-[#f7f4fd] p-6"><p className="section-label text-violet-700">Performance Highlights</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{highlights.length ? highlights.map((message) => <p key={message} className="text-sm leading-6 text-zinc-700">• {message}</p>) : <p className="text-sm text-zinc-500">当前数据不足以生成可靠的 Highlights。</p>}</div>{activitySpend !== performance.spend && <p className="mt-5 border-t border-violet-100 pt-4 text-xs text-violet-800">Campaign Recorded Spend 为 {currency.format(performance.spend)}，Activity Total Spend 为 {currency.format(activitySpend)}。两者作为独立记录展示，系统不会自动覆盖。</p>}</section>

    <div className="mt-8"><InsightPanel kind="campaign-review" context={aiContext} allowPrint /></div>

    <PerformanceTable title="Performance by Activity" description="Opportunity 通过 lead_id → Lead.activity_id 归属于 Activity。" headers={["Activity", "Type", "Spend", "Leads", "Qualified", "Opportunities", "Open Pipeline", "Won Revenue", "CPL", "ROI"]}>{activityRows.map(({ activity, metrics }) => <tr key={activity.id}><Cell strong>{activity.name}</Cell><Cell>{activity.type}</Cell><Cell>{currency.format(metrics.spend)}</Cell><Cell>{metrics.leads}</Cell><Cell>{metrics.qualifiedLeads}</Cell><Cell>{metrics.opportunities}</Cell><Cell>{currency.format(metrics.openPipeline)}</Cell><Cell>{currency.format(metrics.wonRevenue)}</Cell><Cell>{metrics.cpl === null ? "—" : currency.format(metrics.cpl)}</Cell><Cell>{formatPercent(metrics.roi)}</Cell></tr>)}</PerformanceTable>

    <PerformanceTable title="Performance by Lead Source" description="Source 没有可靠 Spend 分配，因此不展示虚构的 CPL 或 ROI。" headers={["Source", "Leads", "Qualified Leads", "Opportunities", "Won Revenue", "Conversion Rate"]}>{sourceRows.map((row) => <tr key={row.source}><Cell strong>{row.source}</Cell><Cell>{row.leads}</Cell><Cell>{row.qualifiedLeads}</Cell><Cell>{row.opportunities}</Cell><Cell>{currency.format(row.wonRevenue)}</Cell><Cell>{formatPercent(row.conversionRate)}</Cell></tr>)}</PerformanceTable>

    <RelatedTable title="Activities" description="当前 Campaign 下的执行活动。">{relatedActivities.map((activity) => <tr key={activity.id}><Cell strong>{activity.name}</Cell><Cell>{activity.type}</Cell><Cell>{formatDate(activity.startDate)}</Cell><Cell>{activity.location}</Cell><td className="px-5 py-4"><ActivityStatusBadge status={activity.status} /></td></tr>)}</RelatedTable>
    <RelatedTable title="Leads" description="通过 campaign_id 归因到当前 Campaign。">{supabaseLeads.map((lead) => <tr key={lead.id}><Cell strong>{lead.name}</Cell><Cell>{lead.company}</Cell><td className="px-5 py-4"><LeadStatusBadge status={lead.status} /></td><Cell>{lead.source}</Cell><Cell>{currency.format(lead.potentialValue)}</Cell></tr>)}</RelatedTable>
    <RelatedTable title="Opportunities" description="优先使用 Opportunity.campaign_id，缺失时回退到关联 Lead 的 Campaign。">{opportunities.map((item) => <tr key={item.id}><Cell strong>{item.name}</Cell><Cell>{item.company}</Cell><td className="px-5 py-4"><OpportunityStatusBadge stage={item.stage} /></td><Cell>{currency.format(item.value)}</Cell><Cell>{item.owner}</Cell></tr>)}</RelatedTable>

    {reportOpen && <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/45 p-4 print:absolute print:bg-white print:p-0"><article className="mx-auto my-8 max-w-4xl rounded-2xl bg-white p-7 shadow-2xl print:my-0 print:max-w-none print:rounded-none print:shadow-none"><div className="flex flex-wrap justify-between gap-4 border-b border-zinc-200 pb-5 print:hidden"><div><p className="section-label">Campaign Report</p><h2 className="mt-2 text-2xl font-semibold">{campaign.name}</h2></div><div className="flex gap-2"><button onClick={exportReportCsv} className="rounded-[10px] border border-zinc-200 px-3 py-2 text-sm">Export CSV</button><button onClick={() => window.print()} className="rounded-[10px] bg-zinc-900 px-3 py-2 text-sm text-white">Print / Save PDF</button><button onClick={() => setReportOpen(false)} className="rounded-[10px] border border-zinc-200 px-3 py-2 text-sm">关闭</button></div></div><div className="py-7"><h2 className="hidden text-2xl font-semibold print:block">{campaign.name} — Campaign Performance Report</h2><p className="mt-2 text-sm text-zinc-500">{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</p><dl className="mt-7 grid gap-5 sm:grid-cols-3">{[["Budget", currency.format(campaign.budget)], ["Spend", currency.format(performance.spend)], ["Leads", performance.leads], ["Qualified Leads", performance.qualifiedLeads], ["Opportunities", performance.opportunities], ["Open Pipeline", currency.format(performance.openPipeline)], ["Won Revenue", currency.format(performance.wonRevenue)], ["CPL", performance.cpl === null ? "—" : currency.format(performance.cpl)], ["ROI", formatPercent(performance.roi)], ["ROAS", formatRatio(performance.roas)], ["Win Rate", formatPercent(performance.winRate)]].map(([label, value]) => <InfoItem key={label} label={String(label)} value={String(value)} />)}</dl><div className="mt-8 border-t border-zinc-200 pt-6"><h3 className="font-semibold">Summary</h3><p className="mt-3 text-sm leading-7 text-zinc-700">{reportSummary}</p></div></div></article></div>}
  </AppShell>;
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { return <div className={`${accent ? "bg-[#eeeafd]" : "bg-[#faf9f6]"} p-6`}><p className="section-label">{label}</p><p className="metric-value mt-5 text-[30px]">{value}</p></div>; }
function InfoItem({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) { return <div><dt className="section-label">{label}</dt><dd className={`mt-2 text-[#111111] ${emphasis ? "font-display text-xl" : "text-sm font-medium"}`}>{value}</dd></div>; }
function Cell({ children, strong = false }: { children: ReactNode; strong?: boolean }) { return <td className={`whitespace-nowrap px-5 py-4 text-zinc-600 ${strong ? "font-medium text-zinc-950" : ""}`}>{children}</td>; }
function PerformanceTable({ title, description, headers, children }: { title: string; description: string; headers: string[]; children: ReactNode }) { return <section className="mt-8 overflow-hidden rounded-[14px] border border-zinc-200 bg-white"><div className="border-b border-zinc-200 px-6 py-5"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{description}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left text-sm"><thead className="bg-zinc-50 text-[10px] uppercase tracking-[0.14em] text-zinc-500"><tr>{headers.map((header) => <th key={header} className="px-5 py-3.5 font-medium">{header}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{children}</tbody></table></div></section>; }
function RelatedTable({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="mt-8 overflow-hidden rounded-[14px] border border-zinc-200 bg-white"><div className="border-b border-zinc-200 px-6 py-5"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-zinc-500">{description}</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><tbody className="divide-y divide-zinc-100">{children}</tbody></table></div></section>; }
