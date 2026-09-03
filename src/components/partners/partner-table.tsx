import { PartnerStatusBadge } from "./status-badge";
import type { Partner } from "./types";

type PartnerTableProps = {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
};

export function PartnerTable({ partners, onEdit, onDelete }: PartnerTableProps) {
  if (partners.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="font-medium text-slate-900">没有找到 Partner</p>
        <p className="mt-2 text-sm text-slate-500">请尝试调整搜索关键词或筛选条件。</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-zinc-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1060px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Partner</th>
              <th className="px-4 py-3.5 font-semibold">Type</th>
              <th className="px-4 py-3.5 font-semibold">Region</th>
              <th className="px-4 py-3.5 font-semibold">联系人</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 text-center font-semibold">Campaigns</th>
              <th className="px-4 py-3.5 text-center font-semibold">Leads Generated</th>
              <th className="px-5 py-3.5 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partners.map((partner) => (
              <tr key={partner.id} className="transition hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">{partner.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{partner.company}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">{partner.type}</td>
                <td className="px-4 py-4 text-slate-600">{partner.region}</td>
                <td className="px-4 py-4">
                  <p className="text-slate-700">{partner.contactName}</p>
                  <p className="mt-1 text-xs text-slate-500">{partner.email}</p>
                </td>
                <td className="px-4 py-4"><PartnerStatusBadge status={partner.status} /></td>
                <td className="px-4 py-4 text-center font-semibold tabular-nums text-slate-700">{partner.campaigns}</td>
                <td className="px-4 py-4 text-center font-semibold tabular-nums text-slate-700">{partner.leadsGenerated}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onEdit(partner)} className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900">编辑</button>
                    <button type="button" onClick={() => onDelete(partner)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50/70 hover:text-rose-700">删除</button>
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
