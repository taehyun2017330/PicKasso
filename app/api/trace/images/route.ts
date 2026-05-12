import { NextResponse } from "next/server";

import { createImageVariantsBatch } from "@/lib/ai/images";
import type { ImageBatchGenerationInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ImageBatchGenerationInput;
    const result = await createImageVariantsBatch(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate image variants.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
