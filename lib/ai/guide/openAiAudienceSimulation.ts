import "server-only";

import { createOpenAIClient } from "@/lib/ai/openAiClient";
import { getOpenAIGuideTimeoutMs } from "@/lib/ai/openAiSettings";
import {
  simulateAudienceResponseForVariants,
  type AudienceBrandContext,
  type AudiencePersona,
  type AudienceReaction,
  type AudienceSimulationResult,
  type AudienceSimulationVariant,
  type PersonaImageReaction
} from "@/lib/ai/guide/audienceSimulation";

export interface AudienceSimulationInput {
  brand: AudienceBrandContext;
  audience: string;
  personas: AudiencePersona[];
  personaSource?: "mock" | "openai";
  personaModel?: string | null;
  realMode?: boolean;
  variants: AudienceSimulationVariant[];
}

interface RawPersonaReaction {
  personaId: string;
  score: number;
  reaction: string;
  reason: string;
}

interface RawRanking {
  variantId: string;
  score: number;
  reaction: string;
  reason: string;
  personaReactions: RawPersonaReaction[];
}

const audienceSimulationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "rankings"],
  properties: {
    summary: { type: "string" },
    rankings: {
      type: "array",
      minItems: 1,
      maxItems: 9,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["variantId", "score", "reaction", "reason", "personaReactions"],
        properties: {
          variantId: { type: "string" },
          score: { type: "number" },
          reaction: { type: "string" },
          reason: { type: "string" },
          personaReactions: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["personaId", "score", "reaction", "reason"],
              properties: {
                personaId: { type: "string" },
                score: { type: "number" },
                reaction: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
};

function clampScore(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 60;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function compact(value: unknown, fallback: string, maxLength = 180) {
  const text = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return (text || fallback).slice(0, maxLength);
}

function supportsVisionInput(src: string) {
  return /^data:image\/(png|jpe?g|webp|gif);/i.test(src);
}

function buildSimulationPrompt(input: AudienceSimulationInput) {
  const readyVariants = input.variants.filter((variant) => variant.status === "done" && variant.src);

  return {
    system:
      "You are the visual scoring model inside an AI guide for brand image exploration. Score images as the provided personas would react to them. Return JSON only. Keep reactions concise, practical, and tied to visible evidence. Do not mention prompts, APIs, models, or internal system details.",
    user: {
      brand: {
        name: input.brand?.name || "Unnamed brand",
        category: input.brand?.category || "Other / Custom",
        targetAudience: input.audience
      },
      personas: input.personas.map((persona) => ({
        id: persona.id,
        name: persona.name,
        lens: persona.role,
        buyingContext: persona.context,
        priority: persona.priority
      })),
      images: readyVariants.map((variant, index) => ({
        imagePosition: index + 1,
        variantId: variant.id,
        label: variant.styleLabel,
        directionPrompt: variant.prompt
      })),
      instruction:
        "Score each image from 0-100 for average target-user fit. Include exactly one reaction per persona for every image. Use the provided variantId values exactly."
    }
  };
}

function toPersonaReactions(
  raw: RawPersonaReaction[],
  personas: AudiencePersona[]
): PersonaImageReaction[] {
  return personas.map((persona, index) => {
    const match = raw.find((reaction) => reaction.personaId === persona.id) ?? raw[index];

    return {
      personaId: persona.id,
      personaName: persona.name,
      role: persona.role,
      score: clampScore(match?.score),
      reaction: compact(match?.reaction, `${persona.name} has a neutral read.`, 140),
      reason: compact(match?.reason, `${persona.name} is judging whether the image fits ${persona.priority}.`, 260)
    };
  });
}

function buildResult(input: AudienceSimulationInput, rawRankings: RawRanking[], summary: string, model: string): AudienceSimulationResult {
  const readyVariants = input.variants.filter((variant) => variant.status === "done" && variant.src);
  const rankings = rawRankings
    .map((item): AudienceReaction | null => {
      const variant = readyVariants.find((candidate) => candidate.id === item.variantId);
      if (!variant) return null;
      const imageNumber = input.variants.findIndex((candidate) => candidate.id === variant.id) + 1;
      const personaReactions = toPersonaReactions(item.personaReactions, input.personas);
      const score = clampScore(item.score);

      return {
        variantId: variant.id,
        imageNumber,
        label: variant.styleLabel || `Image ${imageNumber}`,
        score,
        reaction: compact(item.reaction, `Average fit is ${score}.`, 140),
        reason: compact(item.reason, "The image has been scored against the confirmed personas.", 260),
        personaReactions
      };
    })
    .filter((item): item is AudienceReaction => Boolean(item))
    .sort((a, b) => b.score - a.score);
  const top = rankings[0];

  return {
    audience: input.audience,
    summary: compact(summary, top ? `${top.label} has the strongest target-user read.` : "The board has been scored.", 220),
    personas: input.personas,
    personaSource: input.personaSource ?? "mock",
    personaModel: input.personaModel ?? null,
    scoreSource: "openai",
    scoreModel: model,
    segments: [
      {
        label: "Best average fit",
        take: top ? `${top.label} leads with a score of ${top.score}.` : "Finished images are needed before scoring."
      },
      {
        label: "Persona spread",
        take: top ? "Open an image to compare the three independent reactions." : "Confirm personas before scoring."
      },
      {
        label: "Next action",
        take: top ? "Select strong candidates or regenerate weak directions." : "Generate the board first."
      }
    ],
    rankings
  };
}

export async function createRealAudienceSimulation(
  input: AudienceSimulationInput,
  model: string
): Promise<AudienceSimulationResult> {
  const readyVariants = input.variants.filter((variant) => variant.status === "done" && variant.src);
  if (!readyVariants.length || readyVariants.some((variant) => !supportsVisionInput(variant.src))) {
    return simulateAudienceResponseForVariants({
      ...input,
      scoreSource: "mock",
      scoreModel: model
    });
  }

  const openai = createOpenAIClient();
  const prompt = buildSimulationPrompt(input);
  const timeout = Math.max(getOpenAIGuideTimeoutMs(), 9000);

  const response = await openai.responses.create(
    {
      model,
      input: [
        {
          role: "system",
          content: prompt.system
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: JSON.stringify(prompt.user) },
            ...readyVariants.map((variant) => ({
              type: "input_image",
              image_url: variant.src,
              detail: "low"
            }))
          ]
        }
      ],
      max_output_tokens: 2400,
      text: {
        format: {
          type: "json_schema",
          name: "audience_image_scores",
          schema: audienceSimulationSchema,
          strict: true
        }
      } as never
    } as never,
    { timeout }
  );

  const parsed = JSON.parse(response.output_text) as { summary?: string; rankings?: RawRanking[] };

  return buildResult(input, parsed.rankings ?? [], parsed.summary ?? "", model);
}
