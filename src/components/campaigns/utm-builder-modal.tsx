"use client";

import { useMemo, useState } from "react";
import { buildUtmLink, type UtmFields } from "./utm-builder";

const emptyFields: UtmFields = {
  landingPageUrl: "",
  source: "",
  medium: "",
  campaign: "",
  content: "",
  term: "",
};

type UtmBuilderModalProps = {
  onClose: () => void;
};

export function UtmBuilderModal({ onClose }: UtmBuilderModalProps) {
  const [fields, setFields] = useState<UtmFields>(emptyFields);
  const [urlTouched, setUrlTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const result = useMemo(() => buildUtmLink(fields), [fields]);

  function update(key: keyof UtmFields, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
    setCopied(false);
    setCopyError("");
  }

  async function copyLink() {
    if (!result.url) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
    } catch {
      setCopyError("Copy failed. Please select and copy the link manually.");
    }
  }

  function reset() {
    setFields(emptyFields);
    setUrlTouched(false);
    setCopied(false);
    setCopyError("");
  }

  const inputClass = "mt-2 w-full rounded-[10px] border border-zinc-200 bg-white px-3 py-2.5 text-[13px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10";
  const labelClass = "text-[13px] font-medium text-zinc-700";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-zinc-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="utm-builder-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="my-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="section-label">CAMPAIGN TOOL</p>
            <h2 id="utm-builder-title" className="mt-2 text-xl font-semibold text-zinc-950">UTM Link Generator</h2>
            <p className="mt-1 text-sm text-zinc-500">Build a trackable campaign link without changing the landing page.</p>
          </div>
          <button type="button" aria-label="Close UTM Builder" onClick={onClose} className="rounded-lg px-2 py-1 text-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">×</button>
        </div>

        <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>Landing Page URL <span className="text-rose-500">*</span>
            <input type="url" required value={fields.landingPageUrl} onChange={(event) => update("landingPageUrl", event.target.value)} onBlur={() => setUrlTouched(true)} className={inputClass} placeholder="https://example.com/demo" />
            {(urlTouched || fields.landingPageUrl) && result.error.startsWith("Landing Page") && <span className="mt-1.5 block text-xs text-rose-600">{result.error}</span>}
            {fields.landingPageUrl && result.error.startsWith("Enter a valid") && <span className="mt-1.5 block text-xs text-rose-600">{result.error}</span>}
          </label>
          <label className={labelClass}>Source <span className="text-rose-500">*</span>
            <input required value={fields.source} onChange={(event) => update("source", event.target.value)} className={inputClass} placeholder="linkedin" />
          </label>
          <label className={labelClass}>Medium <span className="text-rose-500">*</span>
            <input required value={fields.medium} onChange={(event) => update("medium", event.target.value)} className={inputClass} placeholder="social" />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>Campaign <span className="text-rose-500">*</span>
            <input required value={fields.campaign} onChange={(event) => update("campaign", event.target.value)} className={inputClass} placeholder="fall_product_launch" />
            {fields.landingPageUrl && result.error.startsWith("Source") && <span className="mt-1.5 block text-xs text-rose-600">{result.error}</span>}
          </label>
          <label className={labelClass}>Content <span className="font-normal text-zinc-400">(optional)</span>
            <input value={fields.content} onChange={(event) => update("content", event.target.value)} className={inputClass} placeholder="hero_button" />
          </label>
          <label className={labelClass}>Term <span className="font-normal text-zinc-400">(optional)</span>
            <input value={fields.term} onChange={(event) => update("term", event.target.value)} className={inputClass} placeholder="marketing_ops" />
          </label>

          <section className="sm:col-span-2" aria-label="Generated UTM link">
            <div className="flex items-center justify-between gap-3">
              <p className="section-label">GENERATED LINK</p>
              {copied && <span className="text-xs font-medium text-violet-600" role="status">Copied</span>}
            </div>
            <div className="mt-2 min-h-20 break-all rounded-xl border border-zinc-200 bg-[#f8f7f3] p-4 text-sm leading-6 text-zinc-700">
              {result.url || <span className="text-zinc-400">Complete the required fields to generate a link.</span>}
            </div>
            {copyError && <p className="mt-2 text-xs text-rose-600" role="alert">{copyError}</p>}
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 bg-[#faf9f6] px-6 py-4">
          <button type="button" onClick={reset} className="rounded-[10px] border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition hover:bg-zinc-50">Reset</button>
          <button type="button" onClick={copyLink} disabled={!result.url} className="rounded-[10px] bg-zinc-900 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">Copy Link</button>
        </div>
      </div>
    </div>
  );
}
