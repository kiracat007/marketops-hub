import type { InsightResult } from "./types";

export const insightJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "highlights", "risks", "recommendedActions", "analysisSections", "dataNotes"],
  properties: {
    title: { type: "string" }, summary: { type: "string" },
    highlights: { type: "array", items: { type: "string" }, maxItems: 5 },
    risks: { type: "array", items: { type: "string" }, maxItems: 5 },
    recommendedActions: { type: "array", items: { type: "string" }, maxItems: 5 },
    analysisSections: { type: "array", maxItems: 8, items: { type: "object", additionalProperties: false, required: ["title", "detail"], properties: { title: { type: "string" }, detail: { type: "string" } } } },
    dataNotes: { type: "array", items: { type: "string" }, maxItems: 5 },
  },
} as const;

export function parseInsightResult(value: unknown): InsightResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const arrays = ["highlights", "risks", "recommendedActions", "dataNotes"] as const;
  if (typeof item.title !== "string" || typeof item.summary !== "string") return null;
  if (!arrays.every((key) => Array.isArray(item[key]) && (item[key] as unknown[]).length <= 5 && (item[key] as unknown[]).every((entry) => typeof entry === "string"))) return null;
  if (!Array.isArray(item.analysisSections) || item.analysisSections.length > 8 || !item.analysisSections.every((entry) => entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).title === "string" && typeof (entry as Record<string, unknown>).detail === "string")) return null;
  return { title: item.title, summary: item.summary, highlights: item.highlights as string[], risks: item.risks as string[], recommendedActions: item.recommendedActions as string[], analysisSections: item.analysisSections as Array<{title:string;detail:string}>, dataNotes: item.dataNotes as string[] };
}
