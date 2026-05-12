import "server-only";

import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

import { createOpenAIClient } from "@/lib/ai/openAiClient";
import { getOpenAIGuideTimeoutMs } from "@/lib/ai/openAiSettings";
import {
  boardSnapshot,
  type BoardRegenerationBrand,
  type BoardRegenerationReview,
  type BoardRegenerationVariant
} from "@/lib/ai/guide/boardRegeneration";

export interface BoardRegenerationInput {
  brand: BoardRegenerationBrand;
  variants: BoardRegenerationVariant[];
  realMode?: boolean;
}

interface RawBoardRegenerationReview {
  summary: string;
  reasons: string[];
}

const boardRegenerationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "reasons"],
  properties: {
    summary: { type: "string" },
    reasons: {
      type: "array",
      minItems: 4,
      maxItems: 8,
      items: { type: "string" }
    }
  }
};

function supportsDataVisionInput(src: string) {
  return /^data:image\/(png|jpe?g|webp|gif);/i.test(src);
}

function mimeForPath(src: string) {
  const ext = extname(src.split(/[?#]/)[0]).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return null;
}

async function publicAssetDataUrl(src: string) {
  if (!src.startsWith("/")) return null;

  let pathname = "";
  try {
    pathname = decodeURIComponent(src.split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (!pathname.startsWith("/") || pathname.includes("..")) return null;

  const mime = mimeForPath(pathname);
  if (!mime) return null;

  const publicRoot = join(process.cwd(), "public");
  const filePath = normalize(join(publicRoot, pathname));
  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}/`)) return null;

  try {
    const bytes = await readFile(filePath);
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

async function visionInputSource(src: string) {
  if (supportsDataVisionInput(src)) return src;
  return publicAssetDataUrl(src);
}

function compact(value: unknown, fallback: string, maxLength = 260) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return (text || fallback).slice(0, maxLength);
}

function optionId(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reason";
}

function toReview(input: BoardRegenerationInput, raw: RawBoardRegenerationReview, model: string): BoardRegenerationReview {
  const seen = new Set<string>();
  const options = raw.reasons
    .map((reason) => compact(reason, "", 40).toLowerCase())
    .filter(Boolean)
    .filter((reason) => {
      if (seen.has(reason)) return false;
      seen.add(reason);
      return true;
    })
    .slice(0, 8)
    .map((label) => ({
      id: optionId(label),
      label,
      source: "system" as const
    }));

  return {
    source: "openai",
    model,
    summary: compact(raw.summary, "I reviewed the full 3x3 board. Pick what should be avoided before I rebuild the set.", 360),
    options,
    snapshot: boardSnapshot(input.variants)
  };
}

export async function createRealBoardRegenerationReview(
  input: BoardRegenerationInput,
  model: string
): Promise<BoardRegenerationReview> {
  const readyVariants = input.variants.filter((variant) => variant.status === "done" && variant.src);
  const visionItems = (await Promise.all(
    readyVariants.map(async (variant) => ({
      variant,
      imageUrl: await visionInputSource(variant.src)
    }))
  )).filter((item): item is { variant: BoardRegenerationVariant; imageUrl: string } => Boolean(item.imageUrl));
  const visionById = new Set(visionItems.map((item) => item.variant.id));
  const openai = createOpenAIClient();
  const timeout = Math.max(getOpenAIGuideTimeoutMs(), 9000);

  const payload = {
    brand: {
      name: input.brand?.name || "Unnamed brand",
      category: input.brand?.category || "open visual exploration",
      targetAudience: input.brand?.targetAudience || "unspecified audience"
    },
    boardSnapshot: boardSnapshot(input.variants),
    images: readyVariants.map((variant, index) => ({
      imagePosition: index + 1,
      variantId: variant.id,
      label: variant.styleLabel,
      directionPrompt: variant.prompt,
      hasVisionInput: visionById.has(variant.id)
    })),
    instruction:
      "Act as an AI design expert reviewing a 3x3 exploration board before regenerating it. Identify what is visually weak, repetitive, off-brand, or strategically unhelpful. Return a concise summary written to the user and 4-8 short avoid-reason chips. Do not mention APIs, prompts, screenshots, models, JSON, or internal implementation."
  };

  const response = await openai.responses.create(
    {
      model,
      input: [
        {
          role: "system",
          content:
            "You are the AI guide for a brand image exploration tool. You critique the current 3x3 board and suggest what to avoid before the next board is regenerated. Return JSON only."
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: JSON.stringify(payload) },
            ...visionItems.map((item) => ({
              type: "input_image",
              image_url: item.imageUrl,
              detail: "low"
            }))
          ]
        }
      ],
      max_output_tokens: 900,
      text: {
        format: {
          type: "json_schema",
          name: "board_regeneration_review",
          schema: boardRegenerationSchema,
          strict: true
        }
      } as never
    } as never,
    { timeout }
  );

  const parsed = JSON.parse(response.output_text) as RawBoardRegenerationReview;
  return toReview(input, parsed, model);
}
