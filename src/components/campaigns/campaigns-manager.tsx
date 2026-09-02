"use client";

import { useMemo, useState } from "react";
import { CampaignFormModal } from "./campaign-form-modal";
import { CampaignTable } from "./campaign-table";
import { initialCampaigns } from "./mock-data";
import { campaignChannels, campaignStatuses, type Campaign, type CampaignDraft } from "./types";

export function CampaignsManager() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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

  function saveCampaign(draft: CampaignDraft) {
    if (editingCampaign) {
      setCampaigns((current) => current.map((item) => item.id === editingCampaign.id ? { ...draft, id: item.id } : item));
    } else {
      setCampaigns((current) => [{ ...draft, id: Date.now() }, ...current]);
    }
    setFormOpen(false);
  }

  function deleteCampaign(campaign: Campaign) {
    if (window.confirm(`确定删除“${campaign.name}”吗？`)) {
      setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setChannelFilter("All");
  }

  const controlClass = "h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

  return (
    <>
      <section className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
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
            <button type="button" onClick={clearFilters} className="h-11 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800">清除筛选</button>
          )}
        </div>
        <button type="button" onClick={openCreateForm} className="h-11 shrink-0 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700">＋ 新建 Campaign</button>
      </section>

      <div className="mb-3 flex items-center justify-between px-1 text-sm text-slate-500">
        <p>显示 {filteredCampaigns.length} / {campaigns.length} 个 Campaign</p>
      </div>

      <CampaignTable campaigns={filteredCampaigns} onEdit={openEditForm} onDelete={deleteCampaign} />
      {formOpen && <CampaignFormModal campaign={editingCampaign} onClose={() => setFormOpen(false)} onSave={saveCampaign} />}
    </>
  );
}
