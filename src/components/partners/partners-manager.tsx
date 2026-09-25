"use client";

import { useEffect, useMemo, useState } from "react";
import { initialPartners } from "./mock-data";
import { PartnerFormModal } from "./partner-form-modal";
import { PartnerTable } from "./partner-table";
import { partnerStatuses, partnerTypes, type Partner, type PartnerDraft } from "./types";
import { createPartner, deletePartner as deletePartnerRecord, fetchPartners, updatePartner } from "./supabase-data";

export function PartnersManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  useEffect(() => { let active = true; fetchPartners().then((items) => { if (active) setPartners(items); }).catch(() => { if (active) { setPartners(initialPartners); setError("无法从 Supabase 读取 Partners，当前显示本地示例数据。"); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  const filteredPartners = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return partners.filter((partner) => {
      const matchesSearch = partner.name.toLocaleLowerCase().includes(term) || partner.company.toLocaleLowerCase().includes(term);
      const matchesType = typeFilter === "All" || partner.type === typeFilter;
      const matchesStatus = statusFilter === "All" || partner.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [partners, search, statusFilter, typeFilter]);

  function openCreateForm() {
    setEditingPartner(null);
    setFormOpen(true);
  }

  function openEditForm(partner: Partner) {
    setEditingPartner(partner);
    setFormOpen(true);
  }

  async function savePartner(draft: PartnerDraft) {
    setError("");
    try {
      if (editingPartner && typeof editingPartner.id === "string") { const updated = await updatePartner(editingPartner.id, draft); setPartners((current) => current.map((item) => item.id === updated.id ? updated : item)); }
      else { const created = await createPartner(draft); setPartners((current) => [created, ...current]); }
      setFormOpen(false);
    } catch { setError("Partner 保存失败，请检查 Supabase 连接和权限后重试。"); }
  }

  async function deletePartner(partner: Partner) {
    if (!window.confirm(`确定删除“${partner.name}”吗？`)) return;
    try { if (typeof partner.id === "string") await deletePartnerRecord(partner.id); setPartners((current) => current.filter((item) => item.id !== partner.id)); }
    catch { setError("Partner 删除失败；关联数据可能仍在使用它。"); }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  }

  const controlClass = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  return (
    <>
      {loading && <p className="mb-4 text-sm text-zinc-500">正在从 Supabase 加载 Partners...</p>}
      {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
      <section className="mb-6 flex flex-col gap-3 rounded-[14px] border border-zinc-200/80 bg-white p-3.5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
          <label className="relative">
            <span className="sr-only">按名称或公司搜索</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${controlClass} w-full pl-10`} placeholder="搜索名称或公司" />
            <span aria-hidden="true" className="absolute left-3.5 top-2.5 text-slate-400">⌕</span>
          </label>
          <label>
            <span className="sr-only">按类型筛选</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={`${controlClass} w-full`}>
              <option value="All">全部类型</option>
              {partnerTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">按状态筛选</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${controlClass} w-full`}>
              <option value="All">全部状态</option>
              {partnerStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          {(search || typeFilter !== "All" || statusFilter !== "All") && (
            <button type="button" onClick={clearFilters} className="h-10 rounded-[10px] px-3 text-[13px] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800">清除筛选</button>
          )}
        </div>
        <button type="button" onClick={openCreateForm} className="h-10 shrink-0 rounded-[10px] bg-zinc-900 px-4 text-[13px] font-medium text-white transition hover:bg-zinc-800">＋ 新建 Partner</button>
      </section>

      <div className="mb-3 flex items-center justify-between px-1 text-sm text-slate-500">
        <p>显示 {filteredPartners.length} / {partners.length} 个 Partner</p>
      </div>

      <PartnerTable partners={filteredPartners} onEdit={openEditForm} onDelete={deletePartner} />
      {formOpen && <PartnerFormModal partner={editingPartner} onClose={() => setFormOpen(false)} onSave={savePartner} />}
    </>
  );
}
