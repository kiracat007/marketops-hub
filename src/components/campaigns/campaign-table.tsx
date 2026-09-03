import Link from "next/link";
import { StatusBadge } from "./status-badge";
import type { Campaign } from "./types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

type CampaignTableProps = {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
};

export function CampaignTable({ campaigns, onEdit, onDelete }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="font-medium text-slate-900">没有找到 Campaign</p>
        <p className="mt-2 text-sm text-slate-500">请尝试调整搜索关键词或筛选条件。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-zinc-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Campaign</th>
              <th className="px-4 py-3.5 font-semibold">渠道</th>
              <th className="px-4 py-3.5 font-semibold">负责人</th>
              <th className="px-4 py-3.5 font-semibold">预算</th>
              <th className="px-4 py-3.5 font-semibold">周期</th>
              <th className="px-4 py-3.5 font-semibold">状态</th>
              <th className="px-4 py-3.5 font-semibold">Leads</th>
              <th className="px-5 py-3.5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4 font-medium"><Link href={`/campaigns/${campaign.id}`} className="text-slate-950 underline-offset-4 transition hover:text-teal-700 hover:underline">{campaign.name}</Link></td>
                <td className="px-4 py-4 text-slate-600">{campaign.channel}</td>
                <td className="px-4 py-4 text-slate-600">{campaign.owner}</td>
                <td className="px-4 py-5 font-semibold tabular-nums tracking-[-0.015em] text-[#272528]">{currency.format(campaign.budget)}</td>
                <td className="px-4 py-5 whitespace-nowrap font-medium text-[#4e4c48]">{formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}</td>
                <td className="px-4 py-4"><StatusBadge status={campaign.status} /></td>
                <td className="px-4 py-4 tabular-nums text-slate-600"><span className="font-semibold text-slate-900">{campaign.actualLeads}</span> / {campaign.targetLeads}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onEdit(campaign)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900">编辑</button>
                    <button type="button" onClick={() => onDelete(campaign)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50/70 hover:text-rose-700">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
