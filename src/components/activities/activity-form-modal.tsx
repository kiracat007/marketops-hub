"use client";

import { useState, type FormEvent } from "react";
import { initialCampaigns } from "@/components/campaigns/mock-data";
import { initialPartners } from "@/components/partners/mock-data";
import { activityStatuses, activityTypes, type Activity, type ActivityDraft } from "./types";

const campaignNames = initialCampaigns.map((campaign) => campaign.name);
const partnerNames = initialPartners.map((partner) => partner.name);
const emptyActivity: ActivityDraft = { name: "", type: "Event", campaign: campaignNames[0], partner: partnerNames[0], owner: "", location: "", startDate: "", endDate: "", status: "Planning", expectedAttendees: 0, actualAttendees: 0, budget: 0 };

type ActivityFormModalProps = { activity: Activity | null; onClose: () => void; onSave: (draft: ActivityDraft) => void };

export function ActivityFormModal({ activity, onClose, onSave }: ActivityFormModalProps) {
  const [draft, setDraft] = useState<ActivityDraft>(activity ? { ...activity } : emptyActivity);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "请输入活动名称";
    if (!draft.owner.trim()) nextErrors.owner = "请输入负责人";
    if (!draft.location.trim()) nextErrors.location = "请输入地点";
    if (!draft.startDate) nextErrors.startDate = "请选择开始日期";
    if (!draft.endDate) nextErrors.endDate = "请选择结束日期";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) nextErrors.endDate = "结束日期不能早于开始日期";
    if (draft.expectedAttendees < 0) nextErrors.expectedAttendees = "预计人数不能小于 0";
    if (draft.actualAttendees < 0) nextErrors.actualAttendees = "实际人数不能小于 0";
    if (draft.budget < 0) nextErrors.budget = "预算不能小于 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (!validate()) return; onSave({ ...draft, name: draft.name.trim(), owner: draft.owner.trim(), location: draft.location.trim() }); }
  function update<K extends keyof ActivityDraft>(key: K, value: ActivityDraft[K]) { setDraft((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: "" })); }
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";
  const labelClass = "text-sm font-medium text-slate-700";

  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="activity-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="my-6 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h2 id="activity-form-title" className="text-xl font-semibold text-slate-950">{activity ? "编辑 Activity" : "新建 Activity"}</h2><p className="mt-1 text-sm text-slate-500">填写活动信息，并选择关联的 Campaign 和 Partner。</p></div><button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button></div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <label className={labelClass}>活动名称<input name="name" value={draft.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="例如：华南客户体验 Roadshow" />{errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}</label>
          <label className={labelClass}>活动类型<select name="type" value={draft.type} onChange={(e) => update("type", e.target.value as ActivityDraft["type"])} className={inputClass}>{activityTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className={labelClass}>关联 Campaign<select name="campaign" value={draft.campaign} onChange={(e) => update("campaign", e.target.value)} className={inputClass}>{campaignNames.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label className={labelClass}>关联 Partner<select name="partner" value={draft.partner} onChange={(e) => update("partner", e.target.value)} className={inputClass}>{partnerNames.map((name) => <option key={name}>{name}</option>)}</select></label>
          <label className={labelClass}>负责人<input name="owner" value={draft.owner} onChange={(e) => update("owner", e.target.value)} className={inputClass} placeholder="负责人姓名" />{errors.owner && <span className="mt-1 block text-xs text-rose-600">{errors.owner}</span>}</label>
          <label className={labelClass}>地点<input name="location" value={draft.location} onChange={(e) => update("location", e.target.value)} className={inputClass} placeholder="城市、场地或线上平台" />{errors.location && <span className="mt-1 block text-xs text-rose-600">{errors.location}</span>}</label>
          <label className={labelClass}>开始日期<input name="startDate" type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputClass} />{errors.startDate && <span className="mt-1 block text-xs text-rose-600">{errors.startDate}</span>}</label>
          <label className={labelClass}>结束日期<input name="endDate" type="date" value={draft.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} />{errors.endDate && <span className="mt-1 block text-xs text-rose-600">{errors.endDate}</span>}</label>
          <label className={labelClass}>状态<select name="status" value={draft.status} onChange={(e) => update("status", e.target.value as ActivityDraft["status"])} className={inputClass}>{activityStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className={labelClass}>预算（USD）<input name="budget" type="number" min="0" value={draft.budget} onChange={(e) => update("budget", Number(e.target.value))} className={inputClass} />{errors.budget && <span className="mt-1 block text-xs text-rose-600">{errors.budget}</span>}</label>
          <label className={labelClass}>预计参与人数<input name="expectedAttendees" type="number" min="0" value={draft.expectedAttendees} onChange={(e) => update("expectedAttendees", Number(e.target.value))} className={inputClass} />{errors.expectedAttendees && <span className="mt-1 block text-xs text-rose-600">{errors.expectedAttendees}</span>}</label>
          <label className={labelClass}>实际参与人数<input name="actualAttendees" type="number" min="0" value={draft.actualAttendees} onChange={(e) => update("actualAttendees", Number(e.target.value))} className={inputClass} />{errors.actualAttendees && <span className="mt-1 block text-xs text-rose-600">{errors.actualAttendees}</span>}</label>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">取消</button><button type="submit" className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">{activity ? "保存修改" : "创建 Activity"}</button></div>
      </form>
    </div>
  </div>;
}
