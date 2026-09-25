"use client";

import { useEffect, useState } from "react";
import { fetchActivities } from "@/components/activities/supabase-data";
import type { Activity } from "@/components/activities/types";
import { fetchCampaigns } from "@/components/campaigns/supabase-data";
import type { Campaign } from "@/components/campaigns/types";
import { fetchLeadsFromSupabase, updateLeadFollowUpInSupabase } from "@/components/leads/supabase-data";
import type { LeadRecord } from "@/components/leads/types";
import { fetchOpportunities } from "@/components/opportunities/supabase-data";
import type { Opportunity } from "@/components/opportunities/types";
import { compareTaskPriority, compareTasksByAttention, getTaskDueCategory, shouldUpdateLeadWhenTaskCompletes } from "./logic";
import { createTask, deleteTask, fetchTasks, updateTask } from "./supabase-data";
import { TaskFormModal } from "./task-form-modal";
import { TaskTable } from "./task-table";
import { taskPriorities, taskStatuses, taskTypes, type Task, type TaskDraft } from "./types";

type Sort = "attention" | "due" | "priority" | "updated";

export function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]); const [leads, setLeads] = useState<LeadRecord[]>([]); const [opportunities, setOpportunities] = useState<Opportunity[]>([]); const [campaigns, setCampaigns] = useState<Campaign[]>([]); const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [status, setStatus] = useState("All"); const [priority, setPriority] = useState("All"); const [owner, setOwner] = useState("All"); const [type, setType] = useState("All"); const [due, setDue] = useState("All"); const [sort, setSort] = useState<Sort>("attention");
  const [editing, setEditing] = useState<Task | null>(null); const [formOpen, setFormOpen] = useState(false); const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("due"); let active = true;
    Promise.all([fetchTasks(), fetchLeadsFromSupabase(), fetchOpportunities(), fetchCampaigns(), fetchActivities()])
      .then(([taskItems, leadItems, opportunityItems, campaignItems, activityItems]) => { if (active) { setTasks(taskItems); setLeads(leadItems); setOpportunities(opportunityItems); setCampaigns(campaignItems); setActivities(activityItems); if (requested) setDue(requested); } })
      .catch(() => { if (active) setError("Unable to load Tasks from Supabase. Run the V3 migration and verify demo permissions."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const owners = [...new Set(tasks.map((item) => item.owner).filter(Boolean))].sort(); const now = new Date(); const term = search.trim().toLowerCase();
  const filtered = tasks.filter((task) => { const timing = getTaskDueCategory(task, now); return (task.title.toLowerCase().includes(term) || task.description.toLowerCase().includes(term)) && (status === "All" || task.status === status) && (priority === "All" || task.priority === priority) && (owner === "All" || task.owner === owner) && (type === "All" || task.type === type) && (due === "All" || timing === due); }).sort((a, b) => sort === "attention" ? compareTasksByAttention(a, b, now) : sort === "due" ? (a.dueAt || "9999").localeCompare(b.dueAt || "9999") : sort === "priority" ? compareTaskPriority(a, b) : b.updatedAt.localeCompare(a.updatedAt));
  const dueToday = tasks.filter((item) => getTaskDueCategory(item, now) === "today").length; const overdue = tasks.filter((item) => getTaskDueCategory(item, now) === "overdue").length; const open = tasks.filter((item) => item.status === "Open" || item.status === "In Progress").length; const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); const completedWeek = tasks.filter((item) => item.status === "Completed" && item.completedAt && new Date(item.completedAt) >= weekAgo).length;

  async function save(draft: TaskDraft) { setSaveError(""); try { if (editing) { const completedAt = draft.status === "Completed" && editing.status !== "Completed" ? new Date().toISOString() : draft.completedAt; const updated = await updateTask(editing.id, { ...draft, completedAt }); if (draft.status === "Completed" && editing.status !== "Completed" && shouldUpdateLeadWhenTaskCompletes(updated)) { try { const lead = await updateLeadFollowUpInSupabase(updated.leadId, { lastContactedAt: completedAt }); setLeads((current) => current.map((item) => item.id === lead.id ? lead : item)); } catch (syncError) { await updateTask(editing.id, editing); throw syncError; } } setTasks((current) => current.map((item) => item.id === updated.id ? updated : item)); } else { const created = await createTask(draft); setTasks((current) => [created, ...current]); } setEditing(null); setFormOpen(false); } catch { setSaveError("Task could not be saved consistently. Changes were rolled back where possible."); } }
  async function complete(task: Task) { const nowIso = new Date().toISOString(); const draft: TaskDraft = { ...task, status: "Completed", completedAt: nowIso }; try { const updated = await updateTask(task.id, draft); if (shouldUpdateLeadWhenTaskCompletes(task)) { try { const lead = await updateLeadFollowUpInSupabase(task.leadId, { lastContactedAt: nowIso }); setLeads((current) => current.map((item) => item.id === lead.id ? lead : item)); } catch (syncError) { await updateTask(task.id, task); throw syncError; } } setTasks((current) => current.map((item) => item.id === updated.id ? updated : item)); } catch { setError("Task completion could not be synchronized with its Lead. Changes were rolled back where possible."); } }
  async function remove(task: Task) { if (!window.confirm(`Delete “${task.title}”? Related records will not be deleted.`)) return; try { await deleteTask(task.id); setTasks((current) => current.filter((item) => item.id !== task.id)); } catch { setError("Task could not be deleted."); } }

  const control = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] outline-none focus:border-[#9d88df]";
  if (loading) return <div className="rounded-[14px] border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">Loading Tasks from Supabase...</div>;
  return <>{error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
    <section className="mb-8 grid gap-px overflow-hidden rounded-[16px] border border-zinc-200 bg-zinc-200 sm:grid-cols-2 xl:grid-cols-4">{[["Due Today", dueToday], ["Overdue", overdue], ["Open Tasks", open], ["Completed This Week", completedWeek]].map(([label, value], index) => <div key={label} className={`${index === 1 && Number(value) > 0 ? "bg-[#f8eeee]" : index === 0 ? "bg-[#eeeafd]" : "bg-[#fdfcf9]"} p-6`}><p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p><p className="metric-value mt-5 text-[36px]">{value}</p></div>)}</section>
    <section className="mb-5 flex flex-wrap gap-3 rounded-[14px] border border-zinc-200 bg-white p-3.5"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks" className={`${control} min-w-[180px] flex-1`} /><select value={status} onChange={(e) => setStatus(e.target.value)} className={control}><option>All</option>{taskStatuses.map((item) => <option key={item}>{item}</option>)}</select><select value={priority} onChange={(e) => setPriority(e.target.value)} className={control}><option>All</option>{taskPriorities.map((item) => <option key={item}>{item}</option>)}</select><select value={type} onChange={(e) => setType(e.target.value)} className={control}><option>All</option>{taskTypes.map((item) => <option key={item}>{item}</option>)}</select>{owners.length > 0 && <select value={owner} onChange={(e) => setOwner(e.target.value)} className={control}><option>All</option>{owners.map((item) => <option key={item}>{item}</option>)}</select>}<select value={due} onChange={(e) => setDue(e.target.value)} className={control}><option value="All">All due dates</option><option value="overdue">Overdue</option><option value="today">Due Today</option><option value="upcoming">Upcoming</option><option value="none">No Due Date</option></select><select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={control}><option value="attention">Sort: Attention</option><option value="due">Sort: Due Date</option><option value="priority">Sort: Priority</option><option value="updated">Sort: Updated</option></select><button onClick={() => { setEditing(null); setFormOpen(true); }} className="h-10 rounded-[10px] bg-zinc-900 px-4 text-[13px] text-white">+ Create Task</button></section>
    <div className="mb-3 px-1 text-sm text-zinc-500">Showing {filtered.length} / {tasks.length} tasks</div><TaskTable tasks={filtered} leads={leads} opportunities={opportunities} campaigns={campaigns} activities={activities} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onComplete={complete} onDelete={remove} />
    {formOpen && <TaskFormModal task={editing} leads={leads} opportunities={opportunities} campaigns={campaigns} activities={activities} error={saveError} onClose={() => { setFormOpen(false); setEditing(null); setSaveError(""); }} onSave={save} />}
  </>;
}
