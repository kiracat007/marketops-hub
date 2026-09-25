import OpenAI from "openai";
import { NextResponse } from "next/server";
import { generateInsight } from "@/lib/ai/generate-insight";
import { buildInsightPrompt, groundingInstructions } from "@/lib/ai/prompt";
import { insightJsonSchema } from "@/lib/ai/schema";
import type { InsightKind, MarketingSnapshot } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { kind?: InsightKind; context?: MarketingSnapshot };
    if (!body.context || !["weekly-brief", "campaign-review"].includes(body.kind ?? "")) return NextResponse.json({ error: "Invalid insight request." }, { status: 400 });
    const liveEnabled = process.env.AI_LIVE_ENABLED === "true";
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    const response = await generateInsight(body.kind!, body.context, { liveEnabled, apiKey, model }, async (kind, context) => {
      const client = new OpenAI({ apiKey });
      const completion = await client.responses.create({
        model: model!,
        instructions: groundingInstructions,
        input: buildInsightPrompt(kind, context),
        text: { format: { type: "json_schema", name: "marketing_insight", strict: true, schema: insightJsonSchema } },
      });
      return JSON.parse(completion.output_text);
    });
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Unable to generate the analysis." }, { status: 500 });
  }
}
