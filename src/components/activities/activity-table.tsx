import { ActivityStatusBadge } from "./status-badge";
import type { Activity } from "./types";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
function formatDate(value: string) { return dateFormatter.format(new Date(`${value}T00:00:00Z`)); }

type ActivityTableProps = {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
};

export function ActivityTable({ activities, onEdit, onDelete }: ActivityTableProps) {
  if (activities.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="font-medium text-slate-900">没有找到 Activity</p><p className="mt-2 text-sm text-slate-500">请尝试调整搜索关键词或筛选条件。</p></div>;
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-zinc-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1380px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th className="px-5 py-3.5 font-semibold">Activity Name</th><th className="px-4 py-3.5 font-semibold">Type</th><th className="px-4 py-3.5 font-semibold">Campaign</th><th className="px-4 py-3.5 font-semibold">Partner</th><th className="px-4 py-3.5 font-semibold">Date</th><th className="px-4 py-3.5 font-semibold">Location</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 text-center font-semibold">Attendees</th><th className="px-5 py-3.5 text-right font-semibold">操作</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {activities.map((activity) => <tr key={activity.id} className="transition hover:bg-slate-50/80">
              <td className="px-5 py-4"><p className="font-medium text-slate-950">{activity.name}</p><p className="mt-1 text-xs text-slate-500">负责人：{activity.owner}</p></td>
              <td className="px-4 py-4 text-slate-600">{activity.type}</td><td className="max-w-52 px-4 py-4 text-slate-600">{activity.campaign}</td><td className="max-w-48 px-4 py-4 text-slate-600">{activity.partner}</td>
              <td className="px-4 py-5 whitespace-nowrap font-medium text-[#4e4c48]">{formatDate(activity.startDate)}{activity.endDate !== activity.startDate && <> — {formatDate(activity.endDate)}</>}</td>
              <td className="px-4 py-4 text-slate-600">{activity.location}</td><td className="px-4 py-4"><ActivityStatusBadge status={activity.status} /></td>
              <td className="px-4 py-4 text-center tabular-nums text-slate-600"><span className="font-semibold text-slate-900">{activity.actualAttendees}</span> / {activity.expectedAttendees}</td>
              <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEdit(activity)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900">编辑</button><button type="button" onClick={() => onDelete(activity)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50/70 hover:text-rose-700">删除</button></div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
