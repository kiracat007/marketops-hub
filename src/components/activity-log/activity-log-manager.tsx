"use client";

import { useMemo, useState } from "react";
import { initialActivityLogs } from "./mock-data";
import { ActivityLogTypeBadge } from "./type-badge";
import { activityLogModules, activityLogTypes } from "./types";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function ActivityLogManager() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const sortedLogs = useMemo(
    () => [...initialActivityLogs].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [],
  );

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return sortedLogs.filter(
      (log) =>
        log.description.toLocaleLowerCase().includes(term) &&
        (moduleFilter === "All" || log.module === moduleFilter) &&
        (typeFilter === "All" || log.type === typeFilter),
    );
  }, [moduleFilter, search, sortedLogs, typeFilter]);

  const hasFilters = search || moduleFilter !== "All" || typeFilter !== "All";
  const controlClass = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  function clearFilters() {
    setSearch("");
    setModuleFilter("All");
    setTypeFilter("All");
  }

  return (
    <>
      <section className="mb-6 rounded-[14px] border border-zinc-200/80 bg-white p-3.5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1fr)_180px_190px_auto]">
          <label className="relative">
            <span className="sr-only">搜索操作描述</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${controlClass} w-full pl-10`} placeholder="搜索操作描述" />
            <span aria-hidden="true" className="absolute left-3.5 top-2.5 text-slate-400">⌕</span>
          </label>
          <label>
            <span className="sr-only">按模块筛选</span>
            <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} className={`${controlClass} w-full`}>
              <option value="All">全部模块</option>
              {activityLogModules.map((module) => <option key={module}>{module}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">按操作类别筛选</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={`${controlClass} w-full`}>
              <option value="All">全部操作类别</option>
              {activityLogTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          {hasFilters && <button type="button" onClick={clearFilters} className="h-10 rounded-[10px] px-3 text-[13px] text-zinc-500 transition hover:bg-zinc-100">清除筛选</button>}
        </div>
      </section>

      <div className="mb-3 px-1 text-sm text-slate-500">显示 {filteredLogs.length} / {initialActivityLogs.length} 条记录</div>
      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p className="font-medium text-slate-900">没有找到操作记录</p>
          <p className="mt-2 text-sm text-slate-500">请尝试调整搜索关键词或筛选条件。</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-zinc-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">时间</th>
                  <th className="px-4 py-3.5 font-semibold">操作类型</th>
                  <th className="px-4 py-3.5 font-semibold">模块</th>
                  <th className="px-4 py-3.5 font-semibold">操作描述</th>
                  <th className="px-5 py-3.5 font-semibold">操作人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{dateFormatter.format(new Date(log.timestamp))}</td>
                    <td className="px-4 py-4"><ActivityLogTypeBadge type={log.type} /><p className="mt-1.5 text-xs text-slate-500">{log.action}</p></td>
                    <td className="px-4 py-4"><span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{log.module}</span></td>
                    <td className="px-4 py-4 font-medium text-slate-800">{log.description}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
