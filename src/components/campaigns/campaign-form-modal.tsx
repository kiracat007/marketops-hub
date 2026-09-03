"use client";

import { useState, type FormEvent } from "react";
import { campaignChannels, campaignStatuses, type Campaign, type CampaignDraft } from "./types";

const emptyCampaign: CampaignDraft = {
  name: "",
  channel: "LinkedIn",
  owner: "",
  budget: 0,
  startDate: "",
  endDate: "",
  status: "Planning",
  targetLeads: 0,
  actualLeads: 0,
};

type CampaignFormModalProps = {
  campaign: Campaign | null;
  onClose: () => void;
  onSave: (draft: CampaignDraft) => void;
};

export function CampaignFormModal({ campaign, onClose, onSave }: CampaignFormModalProps) {
  const [draft, setDraft] = useState<CampaignDraft>(campaign ? { ...campaign } : emptyCampaign);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "请输入 Campaign 名称";
    if (!draft.owner.trim()) nextErrors.owner = "请输入负责人";
    if (!draft.startDate) nextErrors.startDate = "请选择开始日期";
    if (!draft.endDate) nextErrors.endDate = "请选择结束日期";
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) nextErrors.endDate = "结束日期不能早于开始日期";
    if (draft.budget < 0) nextErrors.budget = "预算不能小于 0";
    if (draft.targetLeads < 0) nextErrors.targetLeads = "目标 Leads 不能小于 0";
    if (draft.actualLeads < 0) nextErrors.actualLeads = "实际 Leads 不能小于 0";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    onSave({ ...draft, name: draft.name.trim(), owner: draft.owner.trim() });
  }

  function update<K extends keyof CampaignDraft>(key: K, value: CampaignDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  const inputClass = "mt-2 w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";
  const labelClass = "text-[13px] font-medium text-zinc-700";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="campaign-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="campaign-form-title" className="text-xl font-semibold text-slate-950">{campaign ? "编辑 Campaign" : "新建 Campaign"}</h2>
            <p className="mt-1 text-sm text-slate-500">填写市场 Campaign 的基础信息。</p>
          </div>
          <button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
            <label className={`${labelClass} sm:col-span-2`}>Campaign 名称
              <input name="name" value={draft.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="例如：2027 新品发布 Campaign" />
              {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
            </label>
            <label className={labelClass}>渠道
              <select name="channel" value={draft.channel} onChange={(e) => update("channel", e.target.value as CampaignDraft["channel"])} className={inputClass}>
                {campaignChannels.map((channel) => <option key={channel}>{channel}</option>)}
              </select>
            </label>
            <label className={labelClass}>负责人
              <input name="owner" value={draft.owner} onChange={(e) => update("owner", e.target.value)} className={inputClass} placeholder="负责人姓名" />
              {errors.owner && <span className="mt-1 block text-xs text-rose-600">{errors.owner}</span>}
            </label>
            <label className={labelClass}>预算（USD）
              <input name="budget" type="number" min="0" value={draft.budget} onChange={(e) => update("budget", Number(e.target.value))} className={inputClass} />
              {errors.budget && <span className="mt-1 block text-xs text-rose-600">{errors.budget}</span>}
            </label>
            <label className={labelClass}>状态
              <select name="status" value={draft.status} onChange={(e) => update("status", e.target.value as CampaignDraft["status"])} className={inputClass}>
                {campaignStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className={labelClass}>开始日期
              <input name="startDate" type="date" value={draft.startDate} onChange={(e) => update("startDate", e.target.value)} className={inputClass} />
              {errors.startDate && <span className="mt-1 block text-xs text-rose-600">{errors.startDate}</span>}
            </label>
            <label className={labelClass}>结束日期
              <input name="endDate" type="date" value={draft.endDate} onChange={(e) => update("endDate", e.target.value)} className={inputClass} />
              {errors.endDate && <span className="mt-1 block text-xs text-rose-600">{errors.endDate}</span>}
            </label>
            <label className={labelClass}>目标 Leads
              <input name="targetLeads" type="number" min="0" value={draft.targetLeads} onChange={(e) => update("targetLeads", Number(e.target.value))} className={inputClass} />
              {errors.targetLeads && <span className="mt-1 block text-xs text-rose-600">{errors.targetLeads}</span>}
            </label>
            <label className={labelClass}>实际 Leads
              <input name="actualLeads" type="number" min="0" value={draft.actualLeads} onChange={(e) => update("actualLeads", Number(e.target.value))} className={inputClass} />
              {errors.actualLeads && <span className="mt-1 block text-xs text-rose-600">{errors.actualLeads}</span>}
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">取消</button>
            <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">{campaign ? "保存修改" : "创建 Campaign"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
