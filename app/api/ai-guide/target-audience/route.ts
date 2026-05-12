import { NextResponse } from "next/server";

import { suggestTargetAudiences } from "@/lib/ai/guide/targetAudience";
import type { TargetAudienceSuggestionInput } from "@/lib/ai/guide/types";

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TargetAudienceSuggestionInput>;
    const input: TargetAudienceSuggestionInput = {
      brandName: stringValue(body.brandName),
      category: stringValue(body.category),
      currentAudience: stringValue(body.currentAudience),
      rerollKey: typeof body.rerollKey === "number" ? body.rerollKey : 0
    };

    const output = await suggestTargetAudiences(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to suggest target audiences.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
