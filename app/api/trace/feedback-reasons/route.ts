import { NextResponse } from "next/server";

import { generateFeedbackReasonSteps } from "@/lib/ai/feedbackReasons";
import type { FeedbackReasonPlannerInput } from "@/lib/ai/feedbackReasons";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as FeedbackReasonPlannerInput;
    const output = await generateFeedbackReasonSteps(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate feedback reasons.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
