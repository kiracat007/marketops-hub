import { LeadStatusBadge } from "./status-badge";
import type { Lead } from "./types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
function formatDate(value: string) { return dateFormatter.format(new Date(`${value}T00:00:00Z`)); }

type LeadTableProps = { leads: Lead[]; onEdit: (lead: Lead) => void; onDelete: (lead: Lead) => void };

export function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  if (leads.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="font-medium text-slate-900">没有找到 Lead</p><p className="mt-2 text-sm text-slate-500">请尝试调整搜索关键词或筛选条件。</p></div>;
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1250px] text-left text-sm">
    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5 font-semibold">Name</th><th className="px-4 py-3.5 font-semibold">Company</th><th className="px-4 py-3.5 font-semibold">Source</th><th className="px-4 py-3.5 font-semibold">Campaign</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Potential Value</th><th className="px-4 py-3.5 font-semibold">Owner</th><th className="px-4 py-3.5 font-semibold">Created Date</th><th className="px-5 py-3.5 text-right font-semibold">操作</th></tr></thead>
    <tbody className="divide-y divide-slate-100">{leads.map((lead) => <tr key={lead.id} className="transition hover:bg-slate-50/80">
      <td className="px-5 py-4"><p className="font-medium text-slate-950">{lead.name}</p><p className="mt-1 text-xs text-slate-500">{lead.email}</p></td><td className="px-4 py-4 text-slate-600">{lead.company}</td><td className="px-4 py-4 text-slate-600">{lead.source}</td><td className="max-w-56 px-4 py-4 text-slate-600">{lead.campaign}</td><td className="px-4 py-4"><LeadStatusBadge status={lead.status} /></td><td className="px-4 py-4 font-semibold tabular-nums text-slate-700">{currency.format(lead.potentialValue)}</td><td className="px-4 py-4 text-slate-600">{lead.owner}</td><td className="px-4 py-4 whitespace-nowrap text-slate-600">{formatDate(lead.createdAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEdit(lead)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">编辑</button><button type="button" onClick={() => onDelete(lead)} className="rounded-lg px-3 py-1.5 font-medium text-rose-600 hover:bg-rose-50">删除</button></div></td>
    </tr>)}</tbody>
  </table></div></div>;
}
