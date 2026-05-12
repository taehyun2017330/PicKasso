import { NextResponse } from "next/server";

import { planTraceNode } from "@/lib/ai/planner";
import type { PlannerInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as PlannerInput;
    const plan = await planTraceNode(input);
    return NextResponse.json(plan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to plan trace directions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
