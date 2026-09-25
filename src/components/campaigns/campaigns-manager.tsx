"use client";

import { useEffect, useMemo, useState } from "react";
import { CampaignFormModal } from "./campaign-form-modal";
import { CampaignTable } from "./campaign-table";
import { initialCampaigns } from "./mock-data";
import { campaignChannels, campaignStatuses, type Campaign, type CampaignDraft } from "./types";
import { UtmBuilderModal } from "./utm-builder-modal";
import { createCampaign, deleteCampaign as deleteCampaignRecord, fetchCampaigns, updateCampaign } from "./supabase-data";

export function CampaignsManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [utmBuilderOpen, setUtmBuilderOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCampaigns().then((items) => { if (active) setCampaigns(items); }).catch(() => {
      if (active) { setCampaigns(initialCampaigns); setError("无法从 Supabase 读取 Campaigns，当前显示本地示例数据。"); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredCampaigns = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return campaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLocaleLowerCase().includes(term);
      const matchesStatus = statusFilter === "All" || campaign.status === statusFilter;
      const matchesChannel = channelFilter === "All" || campaign.channel === channelFilter;
      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [campaigns, channelFilter, search, statusFilter]);

  function openCreateForm() {
    setEditingCampaign(null);
    setFormOpen(true);
  }

  function openEditForm(campaign: Campaign) {
    setEditingCampaign(campaign);
    setFormOpen(true);
  }

  async function saveCampaign(draft: CampaignDraft) {
    setError("");
    try {
      if (editingCampaign && typeof editingCampaign.id === "string") {
        const updated = await updateCampaign(editingCampaign.id, draft);
        setCampaigns((current) => current.map((item) => item.id === updated.id ? updated : item));
      } else {
        const created = await createCampaign(draft);
        setCampaigns((current) => [created, ...current]);
      }
      setFormOpen(false);
    } catch { setError("Campaign 保存失败，请检查 Supabase 连接和权限后重试。"); }
  }

  async function deleteCampaign(campaign: Campaign) {
    if (!window.confirm(`确定删除“${campaign.name}”吗？`)) return;
    try {
      if (typeof campaign.id === "string") await deleteCampaignRecord(campaign.id);
      setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
    } catch { setError("Campaign 删除失败；关联数据可能仍在使用它。"); }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setChannelFilter("All");
  }

  const controlClass = "h-10 rounded-[10px] border border-zinc-200 bg-white px-3 text-[13px] text-zinc-700 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5";

  return (
    <>
      {loading && <p className="mb-4 text-sm text-zinc-500">正在从 Supabase 加载 Campaigns...</p>}
      {error && <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}
      <section className="mb-6 flex flex-col gap-3 rounded-[14px] border border-zinc-200/80 bg-white p-3.5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
          <label className="relative">
            <span className="sr-only">搜索 Campaign 名称</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${controlClass} w-full pl-10`} placeholder="搜索 Campaign 名称" />
            <span aria-hidden="true" className="absolute left-3.5 top-2.5 text-slate-400">⌕</span>
          </label>
          <label>
            <span className="sr-only">按状态筛选</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${controlClass} w-full`}>
              <option value="All">全部状态</option>
              {campaignStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">按渠道筛选</span>
            <select value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)} className={`${controlClass} w-full`}>
              <option value="All">全部渠道</option>
              {campaignChannels.map((channel) => <option key={channel}>{channel}</option>)}
            </select>
          </label>
          {(search || statusFilter !== "All" || channelFilter !== "All") && (
            <button type="button" onClick={clearFilters} className="h-10 rounded-[10px] px-3 text-[13px] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800">清除筛选</button>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => setUtmBuilderOpen(true)} className="h-10 rounded-[10px] border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-50">UTM Builder</button>
          <button type="button" onClick={openCreateForm} className="h-10 rounded-[10px] bg-zinc-900 px-4 text-[13px] font-medium text-white transition hover:bg-zinc-800">＋ 新建 Campaign</button>
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between px-1 text-sm text-slate-500">
        <p>显示 {filteredCampaigns.length} / {campaigns.length} 个 Campaign</p>
      </div>

      <CampaignTable campaigns={filteredCampaigns} onEdit={openEditForm} onDelete={deleteCampaign} />
      {formOpen && <CampaignFormModal campaign={editingCampaign} onClose={() => setFormOpen(false)} onSave={saveCampaign} />}
      {utmBuilderOpen && <UtmBuilderModal onClose={() => setUtmBuilderOpen(false)} />}
    </>
  );
}
