import { LeadStatusBadge } from "./status-badge";
import type { LeadRecord } from "./types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
function formatDate(value: string) { return dateFormatter.format(new Date(`${value}T00:00:00Z`)); }

type LeadTableProps = { leads: LeadRecord[]; onEdit: (lead: LeadRecord) => void; onDelete: (lead: LeadRecord) => void };

export function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  if (leads.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="font-medium text-slate-900">没有找到 Lead</p><p className="mt-2 text-sm text-slate-500">请尝试调整搜索关键词或筛选条件。</p></div>;
  return <div className="overflow-hidden rounded-[14px] border border-zinc-200/80 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1250px] text-left text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Name</th><th className="px-4 py-3.5 font-semibold">Company</th><th className="px-4 py-3.5 font-semibold">Source</th><th className="px-4 py-3.5 font-semibold">Campaign</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Potential Value</th><th className="px-4 py-3.5 font-semibold">Owner</th><th className="px-4 py-3.5 font-semibold">Created Date</th><th className="px-5 py-3.5 text-right font-semibold">操作</th></tr></thead>
    <tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id} className="transition hover:bg-slate-50/80">
      <td className="px-5 py-5"><p className="font-medium text-slate-950">{lead.name}</p><p className="mt-1 text-xs text-slate-500">{lead.email}</p></td><td className="px-4 py-5 text-slate-600">{lead.company}</td><td className="px-4 py-5 text-slate-600">{lead.source}</td><td className="max-w-56 px-4 py-5 text-slate-600">{lead.campaign}</td><td className="px-4 py-5"><LeadStatusBadge status={lead.status} /></td><td className="px-4 py-5 font-semibold tabular-nums tracking-[-0.015em] text-[#272528]">{currency.format(lead.potentialValue)}</td><td className="px-4 py-5 text-slate-600">{lead.owner}</td><td className="px-4 py-5 whitespace-nowrap font-medium text-[#4e4c48]">{formatDate(lead.createdAt)}</td><td className="px-5 py-5"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEdit(lead)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900">编辑</button><button type="button" onClick={() => onDelete(lead)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50/70 hover:text-rose-700">删除</button></div></td>
    </tr>)}</tbody>
  </table></div></div>;
}
