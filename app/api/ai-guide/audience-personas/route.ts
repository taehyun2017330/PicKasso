import { NextResponse } from "next/server";

import { generateAudiencePersonas } from "@/lib/ai/guide/audiencePersonas";
import type { AudiencePersonaGenerationInput } from "@/lib/ai/guide/openAiAudiencePersonas";

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AudiencePersonaGenerationInput>;
    const input: AudiencePersonaGenerationInput = {
      audience: stringValue(body.audience),
      brandName: stringValue(body.brandName),
      category: stringValue(body.category),
      realMode: typeof body.realMode === "boolean" ? body.realMode : undefined
    };

    const output = await generateAudiencePersonas(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate audience personas.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
