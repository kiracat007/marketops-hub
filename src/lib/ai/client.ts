import type { InsightKind, InsightResponse, MarketingSnapshot } from "./types";

export async function requestInsight(kind: InsightKind, context: MarketingSnapshot): Promise<InsightResponse> {
  const response = await fetch("/api/ai/insight", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, context }) });
  const data = await response.json() as InsightResponse | { error?: string };
  if (!response.ok || !("result" in data)) throw new Error("error" in data ? data.error : "Unable to generate analysis.");
  return data;
}
