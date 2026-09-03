"use client";

import { useMemo, useState } from "react";
import { ActivityFormModal } from "./activity-form-modal";
import { ActivityTable } from "./activity-table";
import { initialActivities } from "./mock-data";
import { activityStatuses, activityTypes, type Activity, type ActivityDraft } from "./types";

export function ActivitiesManager() {
  const [activities, setActivities] = useState(initialActivities);
  const [search, setSearch] = useState(""); const [typeFilter, setTypeFilter] = useState("All"); const [statusFilter, setStatusFilter] = useState("All");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null); const [formOpen, setFormOpen] = useState(false);
  const filteredActivities = useMemo(() => { const term = search.trim().toLocaleLowerCase(); return activities.filter((activity) => activity.name.toLocaleLowerCase().includes(term) && (typeFilter === "All" || activity.type === typeFilter) && (statusFilter === "All" || activity.status === statusFilter)); }, [activities, search, statusFilter, typeFilter]);
  function openCreateForm() { setEditingActivity(null); setFormOpen(true); }
  function openEditForm(activity: Activity) { setEditingActivity(activity); setFormOpen(true); }
  function saveActivity(draft: ActivityDraft) { if (editingActivity) setActivities((current) => current.map((item) => item.id === editingActivity.id ? { ...draft, id: item.id } : item)); else setActivities((current) => [{ ...draft, id: Date.now() }, ...current]); setFormOpen(false); }
  function deleteActivity(activity: Activity) { if (window.confirm(`确定删除“${activity.name}”吗？`)) setActivities((current) => current.filter((item) => item.id !== activity.id)); }
  function clearFilters() { setSearch(""); setTypeFilter("All"); setStatusFilter("All"); }
  const controlClass = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  return <>
    <section className="mb-6 flex flex-col gap-3 rounded-[14px] border border-zinc-200/80 bg-white p-3.5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
      <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_190px_180px_auto]">
        <label className="relative"><span className="sr-only">搜索活动名称</span><input value={search} onChange={(e) => setSearch(e.target.value)} className={`${controlClass} w-full pl-10`} placeholder="搜索活动名称" /><span aria-hidden="true" className="absolute left-3.5 top-2.5 text-slate-400">⌕</span></label>
        <label><span className="sr-only">按类型筛选</span><select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`${controlClass} w-full`}><option value="All">全部类型</option>{activityTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label><span className="sr-only">按状态筛选</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${controlClass} w-full`}><option value="All">全部状态</option>{activityStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        {(search || typeFilter !== "All" || statusFilter !== "All") && <button type="button" onClick={clearFilters} className="h-10 rounded-[10px] px-3 text-[13px] text-zinc-500 transition hover:bg-zinc-100">清除筛选</button>}
      </div>
      <button type="button" onClick={openCreateForm} className="h-10 shrink-0 rounded-[10px] bg-zinc-900 px-4 text-[13px] font-medium text-white transition hover:bg-zinc-800">＋ 新建 Activity</button>
    </section>
    <div className="mb-3 px-1 text-sm text-slate-500">显示 {filteredActivities.length} / {activities.length} 个 Activity</div>
    <ActivityTable activities={filteredActivities} onEdit={openEditForm} onDelete={deleteActivity} />
    {formOpen && <ActivityFormModal activity={editingActivity} onClose={() => setFormOpen(false)} onSave={saveActivity} />}
  </>;
}
