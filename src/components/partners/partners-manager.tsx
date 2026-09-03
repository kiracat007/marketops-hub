"use client";

import { useMemo, useState } from "react";
import { initialPartners } from "./mock-data";
import { PartnerFormModal } from "./partner-form-modal";
import { PartnerTable } from "./partner-table";
import { partnerStatuses, partnerTypes, type Partner, type PartnerDraft } from "./types";

export function PartnersManager() {
  const [partners, setPartners] = useState(initialPartners);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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

  function savePartner(draft: PartnerDraft) {
    if (editingPartner) {
      setPartners((current) => current.map((item) => item.id === editingPartner.id ? { ...draft, id: item.id } : item));
    } else {
      setPartners((current) => [{ ...draft, id: Date.now() }, ...current]);
    }
    setFormOpen(false);
  }

  function deletePartner(partner: Partner) {
    if (window.confirm(`确定删除“${partner.name}”吗？`)) {
      setPartners((current) => current.filter((item) => item.id !== partner.id));
    }
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
  }

  const controlClass = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  return (
    <>
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
