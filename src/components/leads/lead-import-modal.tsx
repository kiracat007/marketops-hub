"use client";

import { useState, type ChangeEvent } from "react";
import { downloadLeadCsvTemplate, parseLeadsCsv, type LeadImportPreview } from "./csv-import";
import type { LeadDraft } from "./types";

type LeadImportModalProps = {
  onClose: () => void;
  onImport: (leads: LeadDraft[]) => void;
};

export function LeadImportModal({ onClose, onImport }: LeadImportModalProps) {
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<LeadImportPreview | null>(null);
  const [fileError, setFileError] = useState("");

  const validRows = preview?.rows.filter((row) => row.lead !== null) ?? [];
  const invalidRows = preview?.rows.filter((row) => row.lead === null) ?? [];

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(null);
    setFileError("");
    setFileName(file?.name ?? "");
    if (!file) return;
    if (!file.name.toLocaleLowerCase().endsWith(".csv")) {
      setFileError("请选择 .csv 文件");
      return;
    }

    try {
      const result = parseLeadsCsv(await file.text());
      if (result.missingHeaders.length > 0) setFileError(`缺少字段：${result.missingHeaders.join(", ")}`);
      else if (result.rows.length === 0) setFileError("CSV 中没有可以预览的数据行");
      else setPreview(result);
    } catch {
      setFileError("无法读取这个 CSV 文件，请检查文件格式");
    }
  }

  function confirmImport() {
    const leads = validRows.flatMap((row) => row.lead ? [row.lead] : []);
    if (leads.length > 0) onImport(leads);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="lead-import-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="my-6 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div><h2 id="lead-import-title" className="text-xl font-semibold text-slate-950">Import Leads from CSV</h2><p className="mt-1 text-sm text-slate-500">选择文件后先检查预览，再确认导入有效数据。</p></div>
          <button type="button" aria-label="关闭" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm font-medium text-slate-700">选择 CSV 文件<input type="file" accept=".csv,text/csv" onChange={handleFile} className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-slate-700 file:shadow-sm" /></label>
            <button type="button" onClick={downloadLeadCsvTemplate} className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Download CSV Template</button>
          </div>

          {fileName && <p className="text-sm text-slate-500">已选择：<span className="font-medium text-slate-700">{fileName}</span></p>}
          {fileError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{fileError}</div>}

          {preview && <>
            <section className="grid gap-3 sm:grid-cols-3" aria-label="导入预览统计">
              <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Rows</p><p className="mt-2 text-2xl font-semibold text-slate-950">{preview.rows.length}</p></div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Valid Rows</p><p className="mt-2 text-2xl font-semibold text-emerald-800">{validRows.length}</p></div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Invalid Rows</p><p className="mt-2 text-2xl font-semibold text-rose-800">{invalidRows.length}</p></div>
            </section>

            <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Row</th><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Company</th><th className="px-4 py-3 font-semibold">Source</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Result</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{preview.rows.map((row) => <tr key={row.rowNumber} className={row.errors.length ? "bg-rose-50/70" : "bg-white"}><td className="px-4 py-3 text-slate-500">{row.rowNumber}</td><td className="px-4 py-3 font-medium text-slate-900">{row.values.name || "—"}</td><td className="px-4 py-3 text-slate-600">{row.values.company || "—"}</td><td className="px-4 py-3 text-slate-600">{row.values.source || "—"}</td><td className="px-4 py-3 text-slate-600">{row.values.status || "—"}</td><td className="px-4 py-3">{row.errors.length ? <ul className="space-y-1 text-xs font-medium text-rose-700">{row.errors.map((error) => <li key={error}>{error}</li>)}</ul> : <span className="text-xs font-semibold text-emerald-700">Valid</span>}</td></tr>)}</tbody>
              </table>
            </div>
            {invalidRows.length > 0 && <p className="text-sm text-slate-500">无效行不会被导入；你可以继续导入其余 {validRows.length} 条有效数据。</p>}
          </>}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">取消</button>
          <button type="button" onClick={confirmImport} disabled={validRows.length === 0} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">Confirm Import{validRows.length > 0 ? ` (${validRows.length})` : ""}</button>
        </div>
      </div>
    </div>
  );
}
