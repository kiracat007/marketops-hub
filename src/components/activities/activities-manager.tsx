"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityFormModal } from "./activity-form-modal";
import { ActivityTable } from "./activity-table";
import { initialActivities } from "./mock-data";
import { activityStatuses, activityTypes, type Activity, type ActivityDraft } from "./types";
import { createActivity, deleteActivity as deleteActivityRecord, fetchActivities, updateActivity } from "./supabase-data";
import { fetchCampaigns } from "@/components/campaigns/supabase-data";
import { fetchPartners } from "@/components/partners/supabase-data";
import type { Campaign } from "@/components/campaigns/types";
import type { Partner } from "@/components/partners/types";
import { initialCampaigns } from "@/components/campaigns/mock-data";
import { initialPartners } from "@/components/partners/mock-data";

export function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); const [partners, setPartners] = useState<Partner[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [search, setSearch] = useState(""); const [typeFilter, setTypeFilter] = useState("All"); const [statusFilter, setStatusFilter] = useState("All");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null); const [formOpen, setFormOpen] = useState(false);
  useEffect(() => { let active = true; Promise.all([fetchActivities(), fetchCampaigns(), fetchPartners()]).then(([a, c, p]) => { if (active) { setActivities(a); setCampaigns(c); setPartners(p); } }).catch(() => { if (active) { setActivities(initialActivities); setCampaigns(initialCampaigns); setPartners(initialPartners); setError("无法从 Supabase 读取 Activities，当前显示本地示例数据。"); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const filteredActivities = useMemo(() => { const term = search.trim().toLocaleLowerCase(); return activities.filter((activity) => activity.name.toLocaleLowerCase().includes(term) && (typeFilter === "All" || activity.type === typeFilter) && (statusFilter === "All" || activity.status === statusFilter)); }, [activities, search, statusFilter, typeFilter]);
  function openCreateForm() { setEditingActivity(null); setFormOpen(true); }
  function openEditForm(activity: Activity) { setEditingActivity(activity); setFormOpen(true); }
  async function saveActivity(draft: ActivityDraft) { setError(""); try { if (editingActivity && typeof editingActivity.id === "string") { const updated = await updateActivity(editingActivity.id, draft); setActivities((current) => current.map((item) => item.id === updated.id ? updated : item)); } else { const created = await createActivity(draft); setActivities((current) => [created, ...current]); } setFormOpen(false); } catch { setError("Activity 保存失败，请检查 Supabase 连接和关联记录。"); } }
  async function deleteActivity(activity: Activity) { if (!window.confirm(`确定删除“${activity.name}”吗？`)) return; try { if (typeof activity.id === "string") await deleteActivityRecord(activity.id); setActivities((current) => current.filter((item) => item.id !== activity.id)); } catch { setError("Activity 删除失败，请检查关联数据。"); } }
  function clearFilters() { setSearch(""); setTypeFilter("All"); setStatusFilter("All"); }
  const controlClass = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  return <>
    {loading && <p className="mb-4 text-sm text-zinc-500">正在从 Supabase 加载 Activities...</p>}
    {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
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
    {formOpen && <ActivityFormModal activity={editingActivity} campaigns={campaigns} partners={partners} onClose={() => setFormOpen(false)} onSave={saveActivity} />}
  </>;
}
