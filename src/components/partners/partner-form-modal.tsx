"use client";

import { useState, type FormEvent } from "react";
import { partnerStatuses, partnerTypes, type Partner, type PartnerDraft } from "./types";

const emptyPartner: PartnerDraft = {
  name: "",
  type: "KOL",
  company: "",
  region: "",
  email: "",
  phone: "",
  status: "Prospect",
  notes: "",
};

type PartnerFormModalProps = {
  partner: Partner | null;
  onClose: () => void;
  onSave: (draft: PartnerDraft) => void;
};

export function PartnerFormModal({ partner, onClose, onSave }: PartnerFormModalProps) {
  const [draft, setDraft] = useState<PartnerDraft>(partner ? { ...partner } : emptyPartner);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const nextErrors: Record<string, string> = {};
    if (!draft.name.trim()) nextErrors.name = "请输入合作伙伴名称";
    if (!draft.company.trim()) nextErrors.company = "请输入公司或机构";
    if (!draft.region.trim()) nextErrors.region = "请输入地区";
    if (!draft.email.trim()) nextErrors.email = "请输入邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) nextErrors.email = "请输入有效的邮箱地址";
    if (!draft.phone.trim()) nextErrors.phone = "请输入电话";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    onSave({
      ...draft,
      name: draft.name.trim(),
      company: draft.company.trim(),
      region: draft.region.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    });
  }

  function update<K extends keyof PartnerDraft>(key: K, value: PartnerDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  const inputClass = "mt-2 w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";
  const labelClass = "text-[13px] font-medium text-zinc-700";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="partner-form-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 id="partner-form-title" className="text-xl font-semibold text-slate-950">{partner ? "编辑 Partner" : "新建 Partner"}</h2>
            <p className="mt-1 text-sm text-slate-500">填写外部合作伙伴的基础信息。</p>
          </div>
          <button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
            <label className={labelClass}>合作伙伴名称
              <input name="name" value={draft.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="例如：Northstar Creative" />
              {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
            </label>
            <label className={labelClass}>类型
              <select name="type" value={draft.type} onChange={(e) => update("type", e.target.value as PartnerDraft["type"])} className={inputClass}>
                {partnerTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className={labelClass}>公司或机构
              <input name="company" value={draft.company} onChange={(e) => update("company", e.target.value)} className={inputClass} placeholder="所属公司或机构" />
              {errors.company && <span className="mt-1 block text-xs text-rose-600">{errors.company}</span>}
            </label>
            <label className={labelClass}>地区
              <input name="region" value={draft.region} onChange={(e) => update("region", e.target.value)} className={inputClass} placeholder="例如：中国香港" />
              {errors.region && <span className="mt-1 block text-xs text-rose-600">{errors.region}</span>}
            </label>
            <label className={labelClass}>合作状态
              <select name="status" value={draft.status} onChange={(e) => update("status", e.target.value as PartnerDraft["status"])} className={inputClass}>
                {partnerStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className={labelClass}>邮箱
              <input name="email" type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="name@example.com" />
              {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
            </label>
            <label className={labelClass}>电话
              <input name="phone" type="tel" value={draft.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="+86 138 0000 0000" />
              {errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}
            </label>
            <label className={`${labelClass} sm:col-span-2`}>Notes
              <textarea name="notes" value={draft.notes ?? ""} onChange={(e) => update("notes", e.target.value)} className={inputClass} rows={2} />
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">取消</button>
            <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">{partner ? "保存修改" : "创建 Partner"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
