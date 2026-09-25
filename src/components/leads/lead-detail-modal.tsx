import type { LeadRecord } from "./types";
import { LeadStatusBadge } from "./status-badge";
import { canMarkLeadAsContacted, getFollowUpTiming } from "./follow-up";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
const display = (value?: string) => value ? date.format(new Date(value)) : "—";

type ContactFeedback = { type: "success" | "error"; message: string } | null;

type Props = {
  lead: LeadRecord;
  contactPending: boolean;
  contactFeedback: ContactFeedback;
  onClose: () => void;
  onEdit: () => void;
  onCreateOpportunity: () => void;
  onMarkContacted: () => void;
  onCreateTask: () => void;
};

export function LeadDetailModal({ lead, contactPending, contactFeedback, onClose, onEdit, onCreateOpportunity, onMarkContacted, onCreateTask }: Props) {
  const fields = [["Company", lead.company], ["Email", lead.email], ["Phone", lead.phone], ["Campaign", lead.campaign], ["Activity", lead.activity], ["Partner", lead.partner], ["Source", lead.source], ["Owner", lead.owner], ["Potential Value", currency.format(lead.potentialValue)]];
  const timing = getFollowUpTiming(lead.nextFollowUpAt, lead.followUpStatus);
  const canMarkContacted = canMarkLeadAsContacted(lead.status);

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="my-6 w-full max-w-2xl rounded-2xl bg-[#fdfcf9] shadow-2xl">
      <div className="flex justify-between border-b border-zinc-200 p-6">
        <div><p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Lead Detail</p><h2 className="mt-2 text-2xl font-semibold">{lead.name}</h2><div className="mt-3"><LeadStatusBadge status={lead.status} /></div></div>
        <button onClick={onClose} className="text-xl text-zinc-400" aria-label="关闭">×</button>
      </div>
      <div className="p-6">
        <dl className="grid gap-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><dt className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</dt><dd className="mt-2 text-sm text-zinc-800">{value || "—"}</dd></div>)}</dl>
        <section className="mt-8 rounded-[14px] border border-violet-100 bg-[#f5f1fd] p-5">
          <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Follow-up</p><span className="text-xs font-medium capitalize text-violet-700">{timing}</span></div>
          <dl className="mt-5 grid gap-5 sm:grid-cols-3"><div><dt className="text-xs text-zinc-500">Last Contacted</dt><dd className="mt-2 text-sm font-medium">{display(lead.lastContactedAt)}</dd></div><div><dt className="text-xs text-zinc-500">Next Follow-up</dt><dd className="mt-2 text-sm font-medium">{display(lead.nextFollowUpAt)}</dd></div><div><dt className="text-xs text-zinc-500">Status</dt><dd className="mt-2 text-sm font-medium">{lead.followUpStatus || "Not set"}</dd></div></dl>
          {lead.notes && <div className="mt-5 border-t border-violet-100 pt-4"><p className="text-xs text-zinc-500">Notes</p><p className="mt-2 text-sm leading-6 text-zinc-700">{lead.notes}</p></div>}
        </section>
        {contactFeedback && <div role={contactFeedback.type === "error" ? "alert" : "status"} className={`mt-4 rounded-[10px] border px-3 py-2.5 text-sm ${contactFeedback.type === "success" ? "border-emerald-200 bg-emerald-50/70 text-emerald-800" : "border-rose-200 bg-rose-50/70 text-rose-800"}`}>{contactFeedback.type === "success" ? "✓ " : ""}{contactFeedback.message}</div>}
      </div>
      <div className="border-t border-zinc-200 p-4">
        <div className="flex flex-wrap justify-end gap-2">
          {canMarkContacted && <button type="button" onClick={onMarkContacted} disabled={contactPending} className="rounded-[10px] bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-55">{contactPending ? "记录中..." : "标记为已联系"}</button>}
          <button type="button" onClick={onCreateTask} className="rounded-[10px] bg-violet-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-violet-700">创建跟进任务</button>
        </div>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onEdit} className="rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">编辑 Lead</button>
          <button type="button" onClick={onCreateOpportunity} className="rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50">创建商机</button>
        </div>
      </div>
    </div>
  </div>;
}
