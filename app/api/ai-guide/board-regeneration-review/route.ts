import { NextResponse } from "next/server";

import { reviewBoardForRegeneration } from "@/lib/ai/guide/boardRegenerationServer";
import type {
  BoardRegenerationBrand,
  BoardRegenerationVariant
} from "@/lib/ai/guide/boardRegeneration";
import type { BoardRegenerationInput } from "@/lib/ai/guide/openAiBoardRegeneration";

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function brandValue(value: unknown): BoardRegenerationBrand {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  return {
    name: stringValue(record.name),
    category: stringValue(record.category),
    targetAudience: stringValue(record.targetAudience)
  };
}

function variantsValue(value: unknown): BoardRegenerationVariant[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 9)
    .map((item): BoardRegenerationVariant => {
      const record = item && typeof item === "object" ? item as Record<string, unknown> : {};

      return {
        id: stringValue(record.id),
        src: stringValue(record.src),
        prompt: stringValue(record.prompt),
        styleLabel: stringValue(record.styleLabel) || "Image",
        status: record.status === "done" ? "done" : "idle"
      };
    })
    .filter((variant) => variant.id);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<BoardRegenerationInput>;
    const input: BoardRegenerationInput = {
      brand: brandValue(body.brand),
      variants: variantsValue(body.variants),
      realMode: typeof body.realMode === "boolean" ? body.realMode : undefined
    };

    const output = await reviewBoardForRegeneration(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review the board.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
