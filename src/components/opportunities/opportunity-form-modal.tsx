"use client";

import { useState, type FormEvent } from "react";
import type { Campaign } from "@/components/campaigns/types";
import type { LeadRecord } from "@/components/leads/types";
import { prefillOpportunityFromLead } from "./logic";
import { opportunityStages, type Opportunity, type OpportunityDraft } from "./types";

const emptyDraft: OpportunityDraft = { leadId: "", campaignId: "", name: "", company: "", stage: "Discovery", value: 0, owner: "", expectedCloseDate: "", notes: "" };

type Props = { opportunity?: Opportunity | null; initialLead?: LeadRecord | null; leads: LeadRecord[]; campaigns: Campaign[]; error?: string; onClose: () => void; onSave: (draft: OpportunityDraft) => Promise<void> };

export function OpportunityFormModal({ opportunity, initialLead, leads, campaigns, error, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<OpportunityDraft>(opportunity ? { ...opportunity } : initialLead ? prefillOpportunityFromLead(initialLead) : emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const inputClass = "mt-2 w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none transition focus:border-[#9d88df] focus:ring-2 focus:ring-[#9d88df]/10";
  const labelClass = "text-[13px] font-medium text-zinc-700";

  function update<K extends keyof OpportunityDraft>(key: K, value: OpportunityDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  function selectLead(leadId: string) {
    const lead = leads.find((item) => String(item.id) === leadId);
    setDraft((current) => ({ ...current, leadId, company: lead?.company || current.company, campaignId: lead?.campaignId || current.campaignId }));
  }
  function validate() {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "请输入 Opportunity 名称";
    if (draft.value < 0 || !Number.isFinite(draft.value)) next.value = "Value 必须是非负数字";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try { await onSave({ ...draft, name: draft.name.trim(), company: draft.company.trim(), owner: draft.owner.trim(), notes: draft.notes.trim() }); }
    finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="opportunity-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="my-6 w-full max-w-2xl rounded-2xl bg-[#fdfcf9] shadow-2xl">
      <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Pipeline</p><h2 id="opportunity-form-title" className="mt-2 text-xl font-semibold text-zinc-950">{opportunity ? "Edit Opportunity" : "Create Opportunity"}</h2></div><button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-zinc-400 hover:bg-zinc-100">×</button></div>
      <form onSubmit={submit} noValidate>
        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>Opportunity Name *<input value={draft.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />{errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}</label>
          <label className={labelClass}>Company<input value={draft.company} onChange={(e) => update("company", e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Stage *<select value={draft.stage} onChange={(e) => update("stage", e.target.value as OpportunityDraft["stage"])} className={inputClass}>{opportunityStages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <label className={labelClass}>Lead<select value={draft.leadId} onChange={(e) => selectLead(e.target.value)} className={inputClass}><option value="">No linked Lead</option>{leads.map((lead) => <option key={lead.id} value={String(lead.id)}>{lead.name} · {lead.company || "No company"}</option>)}</select></label>
          <label className={labelClass}>Campaign<select value={draft.campaignId} onChange={(e) => update("campaignId", e.target.value)} className={inputClass}><option value="">No linked Campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={String(campaign.id)}>{campaign.name}</option>)}</select></label>
          <label className={labelClass}>Value (USD)<input type="number" min="0" value={draft.value} onChange={(e) => update("value", Number(e.target.value))} className={inputClass} />{errors.value && <span className="mt-1 block text-xs text-rose-600">{errors.value}</span>}</label>
          <label className={labelClass}>Owner<input value={draft.owner} onChange={(e) => update("owner", e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Expected Close Date<input type="date" value={draft.expectedCloseDate} onChange={(e) => update("expectedCloseDate", e.target.value)} className={inputClass} /></label>
          <label className={`${labelClass} sm:col-span-2`}>Notes<textarea rows={3} value={draft.notes} onChange={(e) => update("notes", e.target.value)} className={inputClass} /></label>
          {error && <div className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}
        </div>
        <div className="flex justify-end gap-3 border-t border-zinc-200 bg-[#faf8f5] px-6 py-4"><button type="button" onClick={onClose} className="rounded-[10px] border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700">Cancel</button><button disabled={saving} type="submit" className="rounded-[10px] bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving..." : opportunity ? "Save Changes" : "Create Opportunity"}</button></div>
      </form>
    </div>
  </div>;
}
