import type { InsightKind, InsightResponse, MarketingSnapshot } from "./types";
import { generateRuleBasedInsight } from "./rule-based";
import { parseInsightResult } from "./schema";

export type LiveInsightGenerator = (kind: InsightKind, context: MarketingSnapshot) => Promise<unknown>;
type RuntimeConfig = { liveEnabled: boolean; apiKey?: string; model?: string };

export async function generateInsight(kind: InsightKind, context: MarketingSnapshot, config: RuntimeConfig, liveGenerator?: LiveInsightGenerator): Promise<InsightResponse> {
  const preview = (fallbackReason?: string): InsightResponse => ({ mode: "preview", result: generateRuleBasedInsight(kind, context), ...(fallbackReason ? { fallbackReason } : {}) });
  if (!config.liveEnabled) return preview();
  if (!config.apiKey || !config.model || !liveGenerator) return preview("Live AI is not fully configured.");
  try {
    const parsed = parseInsightResult(await liveGenerator(kind, context));
    return parsed ? { mode: "live", result: parsed } : preview("The live response did not match the required structure.");
  } catch {
    return preview("Live AI analysis was unavailable, so a rule-based preview is shown.");
  }
}
