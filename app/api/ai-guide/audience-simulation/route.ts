import { NextResponse } from "next/server";

import { scoreAudienceImages } from "@/lib/ai/guide/audienceSimulationServer";
import type {
  AudienceBrandContext,
  AudiencePersona,
  AudienceSimulationVariant
} from "@/lib/ai/guide/audienceSimulation";
import type { AudienceSimulationInput } from "@/lib/ai/guide/openAiAudienceSimulation";

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sourceValue(value: unknown): "mock" | "openai" | undefined {
  return value === "mock" || value === "openai" ? value : undefined;
}

function personasValue(value: unknown): AudiencePersona[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 3).map((item, index) => {
    const record = item && typeof item === "object" ? item as Record<string, unknown> : {};

    return {
      id: stringValue(record.id) || `persona-${index + 1}`,
      name: stringValue(record.name) || `Persona ${index + 1}`,
      role: stringValue(record.role) || "Target buyer",
      context: stringValue(record.context) || "Decides whether this image makes the brand worth trying.",
      priority: stringValue(record.priority) || "clear reason to choose the brand"
    };
  });
}

function variantsValue(value: unknown): AudienceSimulationVariant[] {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 9).map((item): AudienceSimulationVariant => {
    const record = item && typeof item === "object" ? item as Record<string, unknown> : {};

    return {
      id: stringValue(record.id),
      src: stringValue(record.src),
      prompt: stringValue(record.prompt),
      styleLabel: stringValue(record.styleLabel) || "Image",
      status: record.status === "done" ? "done" : "idle"
    };
  }).filter((variant) => variant.id);
}

function brandValue(value: unknown): AudienceBrandContext {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  return {
    name: stringValue(record.name),
    category: stringValue(record.category),
    targetAudience: stringValue(record.targetAudience)
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AudienceSimulationInput>;
    const input: AudienceSimulationInput = {
      brand: brandValue(body.brand),
      audience: stringValue(body.audience),
      personas: personasValue(body.personas),
      personaSource: sourceValue(body.personaSource),
      personaModel: stringValue(body.personaModel) || null,
      realMode: typeof body.realMode === "boolean" ? body.realMode : undefined,
      variants: variantsValue(body.variants)
    };

    const output = await scoreAudienceImages(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to simulate audience reactions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
