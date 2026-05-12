import { NextResponse } from "next/server";

import { getOpenAIRuntimeConfig } from "@/lib/ai/openAiSettings";

export async function GET() {
  return NextResponse.json(getOpenAIRuntimeConfig());
}
