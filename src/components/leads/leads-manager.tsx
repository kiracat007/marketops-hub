"use client";

import { useMemo, useState } from "react";
import { exportLeadsCsv } from "./csv-export";
import { LeadFormModal } from "./lead-form-modal";
import { LeadImportModal } from "./lead-import-modal";
import { LeadTable } from "./lead-table";
import { initialLeads } from "./mock-data";
import { leadSources, leadStatuses, type Lead, type LeadDraft } from "./types";

export function LeadsManager() {
  const [leads, setLeads] = useState(initialLeads); const [search, setSearch] = useState(""); const [statusFilter, setStatusFilter] = useState("All"); const [sourceFilter, setSourceFilter] = useState("All"); const [editingLead, setEditingLead] = useState<Lead | null>(null); const [formOpen, setFormOpen] = useState(false); const [importOpen, setImportOpen] = useState(false);
  const filteredLeads = useMemo(() => { const term = search.trim().toLocaleLowerCase(); return leads.filter((lead) => (lead.name.toLocaleLowerCase().includes(term) || lead.company.toLocaleLowerCase().includes(term)) && (statusFilter === "All" || lead.status === statusFilter) && (sourceFilter === "All" || lead.source === sourceFilter)); }, [leads, search, sourceFilter, statusFilter]);
  function openCreateForm() { setEditingLead(null); setFormOpen(true); } function openEditForm(lead: Lead) { setEditingLead(lead); setFormOpen(true); }
  function saveLead(draft: LeadDraft) { if (editingLead) setLeads((current) => current.map((item) => item.id === editingLead.id ? { ...draft, id: item.id } : item)); else setLeads((current) => [{ ...draft, id: Date.now() }, ...current]); setFormOpen(false); }
  function deleteLead(lead: Lead) { if (window.confirm(`确定删除“${lead.name}”吗？`)) setLeads((current) => current.filter((item) => item.id !== lead.id)); }
  function importLeads(drafts: LeadDraft[]) { const firstId = Date.now(); setLeads((current) => [...drafts.map((draft, index) => ({ ...draft, id: firstId + index })), ...current]); setImportOpen(false); }
  function clearFilters() { setSearch(""); setStatusFilter("All"); setSourceFilter("All"); }
  const controlClass = "h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";
  return <><section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between"><div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
    <label className="relative"><span className="sr-only">按姓名或公司搜索</span><input value={search} onChange={(e) => setSearch(e.target.value)} className={`${controlClass} w-full pl-10`} placeholder="搜索姓名或公司" /><span aria-hidden="true" className="absolute left-3.5 top-2.5 text-slate-400">⌕</span></label>
    <label><span className="sr-only">按状态筛选</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${controlClass} w-full`}><option value="All">全部状态</option>{leadStatuses.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label><span className="sr-only">按来源筛选</span><select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={`${controlClass} w-full`}><option value="All">全部来源</option>{leadSources.map((item) => <option key={item}>{item}</option>)}</select></label>
    {(search || statusFilter !== "All" || sourceFilter !== "All") && <button type="button" onClick={clearFilters} className="h-11 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100">清除筛选</button>}</div><div className="flex shrink-0 flex-wrap gap-3"><button type="button" onClick={() => setImportOpen(true)} className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">Import CSV</button><button type="button" onClick={() => exportLeadsCsv(filteredLeads)} disabled={filteredLeads.length === 0} className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Export CSV</button><button type="button" onClick={openCreateForm} className="h-11 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">＋ 新建 Lead</button></div></section>
    <div className="mb-3 px-1 text-sm text-slate-500">显示 {filteredLeads.length} / {leads.length} 个 Lead</div><LeadTable leads={filteredLeads} onEdit={openEditForm} onDelete={deleteLead} />{formOpen && <LeadFormModal lead={editingLead} onClose={() => setFormOpen(false)} onSave={saveLead} />}{importOpen && <LeadImportModal onClose={() => setImportOpen(false)} onImport={importLeads} />}</>;
}
