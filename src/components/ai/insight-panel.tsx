"use client";

import { useState } from "react";
import { Copy, Printer, Sparkles } from "lucide-react";
import { requestInsight } from "@/lib/ai/client";
import type { InsightKind, InsightResponse, MarketingSnapshot } from "@/lib/ai/types";

export function InsightPanel({ kind, context, allowPrint = false }: { kind: InsightKind; context: MarketingSnapshot; allowPrint?: boolean }) {
  const [response, setResponse] = useState<InsightResponse | null>(null);
  const [state, setState] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const label = kind === "weekly-brief" ? "AI Marketing Brief" : "AI Campaign Review";

  async function generate() {
    setState("generating"); setMessage(""); setCopied(false);
    try { setResponse(await requestInsight(kind, context)); setState("success"); }
    catch { setMessage("无法生成分析，请稍后重试。"); setState("error"); }
  }

  async function copy() {
    if (!response) return;
    const { result } = response;
    const text = [result.title, result.summary, ...result.analysisSections.flatMap((item) => [item.title, item.detail]), "Highlights", ...result.highlights.map((item) => `- ${item}`), "Risks", ...result.risks.map((item) => `- ${item}`), "Recommended Actions", ...result.recommendedActions.map((item) => `- ${item}`), "Data Notes", ...result.dataNotes.map((item) => `- ${item}`)].join("\n");
    await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1600);
  }

  return <section className="rounded-[16px] border border-[#d9d0ef] bg-[#f5f1fc] p-6 sm:p-8 print:border-zinc-200 print:bg-white" aria-label={label}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="section-label text-[#695d89]">Marketing Copilot</p><h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#201b2f]">{label}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#706783]">基于当前数据快照生成。Based on the current MarketOps data snapshot. 不会修改任何业务记录。</p></div>
      <button type="button" onClick={generate} disabled={state === "generating"} className="inline-flex items-center gap-2 rounded-[10px] bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 print:hidden"><Sparkles size={16} />{state === "generating" ? "Generating..." : response ? "Regenerate" : "Generate"}</button>
    </div>
    {state === "idle" && <div className="mt-7 rounded-xl border border-dashed border-[#cfc4e9] px-5 py-8 text-center text-sm text-[#756c87]">点击 Generate 生成当前数据快照的分析。</div>}
    {state === "error" && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{message}</p>}
    {response && <div className="mt-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full border border-[#cfc4e9] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#66568f]">{response.mode === "live" ? "Live AI Analysis" : "Rule-based Preview"}</span><div className="flex gap-2 print:hidden"><button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cbe9] bg-white px-3 py-2 text-xs font-medium text-zinc-700"><Copy size={14} />{copied ? "Copied" : "Copy"}</button>{allowPrint && <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cbe9] bg-white px-3 py-2 text-xs font-medium text-zinc-700"><Printer size={14} />Print</button>}</div></div>
      {response.fallbackReason && <p className="mt-4 text-xs text-amber-800">{response.fallbackReason}</p>}
      <h3 className="mt-5 text-lg font-semibold text-zinc-950">{response.result.title}</h3><p className="mt-2 text-sm leading-7 text-zinc-700">{response.result.summary}</p>
      {response.result.analysisSections.length > 0 && <div className="mt-6 grid gap-4 sm:grid-cols-2">{response.result.analysisSections.map((item) => <div key={item.title} className="rounded-xl border border-[#ded7ed] bg-white/55 p-4"><h4 className="text-xs font-semibold text-zinc-900">{item.title}</h4><p className="mt-2 text-sm leading-6 text-zinc-600">{item.detail}</p></div>)}</div>}
      <div className="mt-6 grid gap-6 lg:grid-cols-3"><InsightList title="Highlights" items={response.result.highlights} /><InsightList title="Risks" items={response.result.risks} /><InsightList title="Recommended Actions" items={response.result.recommendedActions} /></div>
      <div className="mt-6 border-t border-[#dcd4ee] pt-5"><InsightList title="Data Notes" items={response.result.dataNotes} /></div>
    </div>}
    <p className="mt-6 text-xs leading-5 text-[#786f87]">AI 输出仅用于辅助分析，最终业务判断由用户完成。</p>
  </section>;
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{title}</h4><ul className="mt-3 space-y-2">{items.map((item, index) => <li key={`${title}-${index}`} className="text-sm leading-6 text-zinc-700">• {item}</li>)}</ul></div>;
}
