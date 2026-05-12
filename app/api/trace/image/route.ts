import { NextResponse } from "next/server";

import { createImageVariant } from "@/lib/ai/images";
import type { ImageGenerationInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as ImageGenerationInput;
    const result = await createImageVariant(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate image variant.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
