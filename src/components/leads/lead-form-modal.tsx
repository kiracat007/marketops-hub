"use client";

import { useState, type FormEvent } from "react";
import type { Activity } from "@/components/activities/types";
import type { Campaign } from "@/components/campaigns/types";
import type { Partner } from "@/components/partners/types";
import { followUpStatuses, leadSources, leadStatuses, type LeadDraft, type LeadRecord } from "./types";

const emptyLead: LeadDraft = { name: "", company: "", email: "", phone: "", source: "Campaign", campaignId: "", activityId: "", partnerId: "", campaign: "未关联", activity: "未关联", partner: "未关联", status: "New", potentialValue: 0, owner: "", createdAt: "", lastContactedAt: "", nextFollowUpAt: "", followUpStatus: "", notes: "" };
function toLocalInput(value?: string) { if (!value) return ""; const date = new Date(value); if (Number.isNaN(date.getTime())) return value.slice(0, 16); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 16); }
type LeadFormModalProps = { lead: LeadRecord | null; campaigns: Campaign[]; activities: Activity[]; partners: Partner[]; saveError: string; onClose: () => void; onSave: (draft: LeadDraft) => Promise<void> };

export function LeadFormModal({ lead, campaigns, activities, partners, saveError, onClose, onSave }: LeadFormModalProps) {
  const [draft, setDraft] = useState<LeadDraft>(lead ? { ...lead } : emptyLead);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const availableActivities = draft.campaignId ? activities.filter((item) => item.campaignId === draft.campaignId) : activities;
  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "请输入姓名";
    if (!draft.company.trim()) nextErrors.company = "请输入公司";
    if (!draft.email.trim()) nextErrors.email = "请输入邮箱"; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) nextErrors.email = "请输入有效的邮箱地址";
    if (!draft.phone.trim()) nextErrors.phone = "请输入电话";
    if (!draft.owner.trim()) nextErrors.owner = "请输入负责人";
    if (!draft.createdAt) nextErrors.createdAt = "请选择创建日期";
    if (draft.potentialValue < 0) nextErrors.potentialValue = "潜在价值不能小于 0";
    setErrors(nextErrors); return Object.keys(nextErrors).length === 0;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validate()) return; setSaving(true); try { await onSave({ ...draft, name: draft.name.trim(), company: draft.company.trim(), email: draft.email.trim(), phone: draft.phone.trim(), owner: draft.owner.trim() }); } finally { setSaving(false); } }
  function update<K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  const inputClass = "mt-2 w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"; const labelClass = "text-[13px] font-medium text-zinc-700";
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="lead-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
    <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h2 id="lead-form-title" className="text-xl font-semibold text-slate-950">{lead ? "编辑 Lead" : "新建 Lead"}</h2><p className="mt-1 text-sm text-slate-500">填写线索信息并选择相关来源。</p></div><button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button></div>
    <form onSubmit={handleSubmit} noValidate>{saveError && <div className="mx-6 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800" role="alert">{saveError}</div>}<div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
      <label className={labelClass}>姓名<input name="name" value={draft.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />{errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}</label>
      <label className={labelClass}>公司<input name="company" value={draft.company} onChange={(e) => update("company", e.target.value)} className={inputClass} />{errors.company && <span className="mt-1 block text-xs text-rose-600">{errors.company}</span>}</label>
      <label className={labelClass}>邮箱<input name="email" type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />{errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}</label>
      <label className={labelClass}>电话<input name="phone" type="tel" value={draft.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />{errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}</label>
      <label className={labelClass}>线索来源<select name="source" value={draft.source} onChange={(e) => update("source", e.target.value as LeadDraft["source"])} className={inputClass}>{leadSources.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className={labelClass}>线索状态<select name="status" value={draft.status} onChange={(e) => update("status", e.target.value as LeadDraft["status"])} className={inputClass}>{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className={labelClass}>关联 Campaign<select name="campaignId" value={draft.campaignId ?? ""} onChange={(e) => { const item = campaigns.find((entry) => String(entry.id) === e.target.value); setDraft((current) => ({ ...current, campaignId: e.target.value, campaign: item?.name ?? "未关联", activityId: "", activity: "未关联" })); }} className={inputClass}><option value="">未关联</option>{campaigns.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
      <label className={labelClass}>关联 Activity<select name="activityId" value={draft.activityId ?? ""} onChange={(e) => { const item = activities.find((entry) => String(entry.id) === e.target.value); setDraft((current) => ({ ...current, activityId: e.target.value, activity: item?.name ?? "未关联" })); }} className={inputClass}><option value="">未关联</option>{availableActivities.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
      <label className={labelClass}>关联 Partner<select name="partnerId" value={draft.partnerId ?? ""} onChange={(e) => { const item = partners.find((entry) => String(entry.id) === e.target.value); setDraft((current) => ({ ...current, partnerId: e.target.value, partner: item?.name ?? "未关联" })); }} className={inputClass}><option value="">未关联</option>{partners.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
      <label className={labelClass}>负责人<input name="owner" value={draft.owner} onChange={(e) => update("owner", e.target.value)} className={inputClass} />{errors.owner && <span className="mt-1 block text-xs text-rose-600">{errors.owner}</span>}</label>
      <label className={labelClass}>潜在价值（USD）<input name="potentialValue" type="number" min="0" value={draft.potentialValue} onChange={(e) => update("potentialValue", Number(e.target.value))} className={inputClass} />{errors.potentialValue && <span className="mt-1 block text-xs text-rose-600">{errors.potentialValue}</span>}</label>
      <label className={labelClass}>创建日期<input name="createdAt" type="date" value={draft.createdAt} onChange={(e) => update("createdAt", e.target.value)} className={inputClass} />{errors.createdAt && <span className="mt-1 block text-xs text-rose-600">{errors.createdAt}</span>}</label>
      <label className={labelClass}>Last Contacted<input name="lastContactedAt" type="datetime-local" value={toLocalInput(draft.lastContactedAt)} onChange={(e) => update("lastContactedAt", e.target.value)} className={inputClass} /></label>
      <label className={labelClass}>Next Follow-up<input name="nextFollowUpAt" type="datetime-local" value={toLocalInput(draft.nextFollowUpAt)} onChange={(e) => update("nextFollowUpAt", e.target.value)} className={inputClass} /></label>
      <label className={labelClass}>Follow-up Status<select name="followUpStatus" value={draft.followUpStatus ?? ""} onChange={(e) => update("followUpStatus", e.target.value as LeadDraft["followUpStatus"])} className={inputClass}><option value="">Not set</option>{followUpStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className={`${labelClass} sm:col-span-2`}>Notes<textarea name="notes" rows={3} value={draft.notes ?? ""} onChange={(e) => update("notes", e.target.value)} className={inputClass} /></label>
    </div><div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">取消</button><button type="submit" disabled={saving} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "正在保存..." : lead ? "保存修改" : "创建 Lead"}</button></div></form>
  </div></div>;
}
