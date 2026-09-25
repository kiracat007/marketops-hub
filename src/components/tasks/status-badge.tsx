import type{TaskPriority,TaskStatus}from"./types";
const statusStyles:Record<TaskStatus,string>={Open:"bg-zinc-100 text-zinc-700","In Progress":"bg-violet-50 text-violet-700",Completed:"bg-emerald-50 text-emerald-700",Cancelled:"bg-rose-50 text-rose-700"};
const priorityStyles:Record<TaskPriority,string>={Low:"text-zinc-500",Medium:"text-amber-700",High:"text-rose-700"};
export function TaskStatusBadge({status}:{status:TaskStatus}){return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[status]}`}>{status}</span>;}
export function TaskPriorityLabel({priority}:{priority:TaskPriority}){return <span className={`text-xs font-semibold ${priorityStyles[priority]}`}>{priority}</span>;}
