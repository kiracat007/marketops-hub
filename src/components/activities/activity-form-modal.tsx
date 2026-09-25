"use client";

import { useState, type FormEvent } from "react";
import type { Campaign } from "@/components/campaigns/types";
import type { Partner } from "@/components/partners/types";
import { activityStatuses, activityTypes, type Activity, type ActivityDraft } from "./types";

const emptyActivity: ActivityDraft = { name: "", type: "Event", campaignId: "", partnerId: "", campaign: "未关联", partner: "未关联", owner: "", location: "", startDate: "", endDate: "", status: "Planning", attendees: 0, budget: 0, spend: 0, targetLeads: 0, notes: "" };

type ActivityFormModalProps = { activity: Activity | null; campaigns: Campaign[]; partners: Partner[]; onClose: () => void; onSave: (draft: ActivityDraft) => void };

export function ActivityFormModal({ activity, campaigns, partners, onClose, onSave }: ActivityFormModalProps) {
  const [draft, setDraft] = useState<ActivityDraft>(activity ? { ...activity, attendees: activity.attendees ?? activity.actualAttendees ?? 0 } : { ...emptyActivity, campaignId: String(campaigns[0]?.id ?? ""), campaign: campaigns[0]?.name ?? "未关联", partnerId: String(partners[0]?.id ?? ""), partner: partners[0]?.name ?? "未关联" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "请输入活动名称";
    if (!draft.owner.trim()) nextErrors.owner = "请输入负责人";
    if (!draft.location.trim()) nextErrors.location = "请输入地点";
    if (!draft.startDate) nextErrors.startDate = "请选择开始日期";
    if (!draft.endDate) nextErrors.endDate = "请选择结束日期";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) nextErrors.endDate = "结束日期不能早于开始日期";
    if (draft.attendees < 0) nextErrors.attendees = "参与人数不能小于 0";
    if (draft.budget < 0) nextErrors.budget = "预算不能小于 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validate()) return; onSave({ ...draft, name: draft.name.trim(), owner: draft.owner.trim(), location: draft.location.trim() }); }
  function update<K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  const inputClass = "mt-2 w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";
  const labelClass = "text-[13px] font-medium text-zinc-700";

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="activity-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h2 id="activity-form-title" className="text-xl font-semibold text-slate-950">{activity ? "编辑 Activity" : "新建 Activity"}</h2><p className="mt-1 text-sm text-slate-500">填写活动信息，并选择关联的 Campaign 和 Partner。</p></div><button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button></div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <label className={labelClass}>活动名称<input name="name" value={draft.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="例如：华南客户体验 Roadshow" />{errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}</label>
          <label className={labelClass}>活动类型<select name="type" value={draft.type} onChange={(e) => update("type", e.target.value as ActivityDraft["type"])} className={inputClass}>{activityTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className={labelClass}>关联 Campaign<select name="campaignId" value={draft.campaignId} onChange={(e) => { const selected = campaigns.find((item) => String(item.id) === e.target.value); update("campaignId", e.target.value); update("campaign", selected?.name ?? "未关联"); }} className={inputClass}>{campaigns.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
          <label className={labelClass}>关联 Partner<select name="partnerId" value={draft.partnerId} onChange={(e) => { const selected = partners.find((item) => String(item.id) === e.target.value); update("partnerId", e.target.value); update("partner", selected?.name ?? "未关联"); }} className={inputClass}><option value="">未关联</option>{partners.map((item) => <option key={item.id} value={String(item.id)}>{item.name}</option>)}</select></label>
          <label className={labelClass}>负责人<input name="owner" value={draft.owner} onChange={(e) => update("owner", e.target.value)} className={inputClass} placeholder="负责人姓名" />{errors.owner && <span className="mt-1 block text-xs text-rose-600">{errors.owner}</span>}</label>
          <label className={labelClass}>地点<input name="location" value={draft.location} onChange={(e) => update("location", e.target.value)} className={inputClass} placeholder="城市、场地或线上平台" />{errors.location && <span className="mt-1 block text-xs text-rose-600">{errors.location}</span>}</label>
          <label className={labelClass}>开始日期<input name="startDate" type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputClass} />{errors.startDate && <span className="mt-1 block text-xs text-rose-600">{errors.startDate}</span>}</label>
          <label className={labelClass}>结束日期<input name="endDate" type="date" value={draft.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} />{errors.endDate && <span className="mt-1 block text-xs text-rose-600">{errors.endDate}</span>}</label>
          <label className={labelClass}>状态<select name="status" value={draft.status} onChange={(e) => update("status", e.target.value as ActivityDraft["status"])} className={inputClass}>{activityStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className={labelClass}>预算（USD）<input name="budget" type="number" min="0" value={draft.budget} onChange={(e) => update("budget", Number(e.target.value))} className={inputClass} />{errors.budget && <span className="mt-1 block text-xs text-rose-600">{errors.budget}</span>}</label>
          <label className={labelClass}>参与人数<input name="attendees" type="number" min="0" value={draft.attendees} onChange={(e) => update("attendees", Number(e.target.value))} className={inputClass} />{errors.attendees && <span className="mt-1 block text-xs text-rose-600">{errors.attendees}</span>}</label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">取消</button><button type="submit" className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">{activity ? "保存修改" : "创建 Activity"}</button></div>
      </form>
    </div>
  </div>;
}
