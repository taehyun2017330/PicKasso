import type { Brand, ImageVariant, TraceNode } from "@/lib/types";
import { hashString } from "@/lib/utils";

export type AudienceBrandContext = Pick<Brand, "category" | "name" | "targetAudience"> | null;

export interface AudienceReaction {
  variantId: string;
  imageNumber: number;
  label: string;
  score: number;
  reaction: string;
  reason: string;
  personaReactions: PersonaImageReaction[];
}

export interface AudienceSegmentReaction {
  label: string;
  take: string;
}

export interface AudiencePersona {
  id: string;
  name: string;
  role: string;
  context: string;
  priority: string;
}

export interface PersonaImageReaction {
  personaId: string;
  personaName: string;
  role: string;
  score: number;
  reaction: string;
  reason: string;
}

export interface AudienceSimulationResult {
  audience: string;
  summary: string;
  personas: AudiencePersona[];
  personaSource?: "mock" | "openai";
  personaModel?: string | null;
  scoreSource?: "mock" | "openai";
  scoreModel?: string | null;
  segments: AudienceSegmentReaction[];
  rankings: AudienceReaction[];
}

export interface AudiencePersonaGenerationOutput {
  source: "mock" | "openai";
  model: string | null;
  personas: AudiencePersona[];
}

export type AudienceSimulationVariant = Pick<ImageVariant, "id" | "prompt" | "src" | "status" | "styleLabel">;

const segmentLabels = ["Quick scanners", "Careful comparers", "Ready-to-act buyers"];
const reactionPhrases = [
  "Stops first because the idea is readable fast.",
  "Feels most credible for this audience.",
  "Creates the clearest emotional hook.",
  "Makes the product promise easiest to understand.",
  "Has the strongest shareable visual angle."
];
const personaNames = ["Maya Chen", "Daniel Brooks", "Sofia Patel"];
const personaRoles = ["Fast scanner", "Careful comparer", "Taste-led buyer"];
const personaPriorities = [
  "clear product value in the first glance",
  "proof that the brand feels credible and worth trying",
  "a visual mood they would save or share"
];

export function audienceRefinementHints(brand: Brand | null) {
  const audience = brand?.targetAudience.trim();
  const category = brand?.category.trim();

  return [
    audience ? `${audience}, but more budget conscious` : "busy first-time buyers",
    category ? `${category.toLowerCase()} early adopters` : "early adopters",
    "visual shoppers who compare quickly",
    "skeptical buyers who need proof"
  ];
}

export function createAudiencePersonas(input: {
  audience: string;
  brand: AudienceBrandContext;
}): AudiencePersona[] {
  const audience = input.audience.trim() || input.brand?.targetAudience || "the target audience";
  const category = input.brand?.category.trim() || "this category";
  const brandName = input.brand?.name.trim() || "the brand";

  return personaNames.map((name, index) => ({
    id: `persona-${index + 1}`,
    name,
    role: personaRoles[index],
    context:
      index === 0
        ? `Chooses ${category.toLowerCase()} quickly during a busy day and needs ${brandName} to read instantly.`
        : index === 1
          ? `Compares several options before buying and looks for a reason ${brandName} feels more trustworthy.`
          : `Already likes the idea of ${audience} and reacts most to the mood, setting, and shareability.`,
    priority: personaPriorities[index]
  }));
}

export function simulateAudienceResponse(input: {
  brand: Brand | null;
  node: TraceNode;
  audience: string;
  personas?: AudiencePersona[];
  personaSource?: "mock" | "openai";
  personaModel?: string | null;
  scoreSource?: "mock" | "openai";
  scoreModel?: string | null;
}): AudienceSimulationResult {
  return simulateAudienceResponseForVariants({
    ...input,
    variants: input.node.variants
  });
}

export function simulateAudienceResponseForVariants(input: {
  brand: AudienceBrandContext;
  variants: AudienceSimulationVariant[];
  audience: string;
  personas?: AudiencePersona[];
  personaSource?: "mock" | "openai";
  personaModel?: string | null;
  scoreSource?: "mock" | "openai";
  scoreModel?: string | null;
}): AudienceSimulationResult {
  const audience = input.audience.trim() || input.brand?.targetAudience || "the target audience";
  const personas = input.personas?.length ? input.personas : createAudiencePersonas({ audience, brand: input.brand });
  const readyVariants = input.variants.filter((variant) => variant.status === "done" && variant.src);
  const rankings = readyVariants
    .map((variant, index): AudienceReaction => {
      const imageNumber = input.variants.findIndex((item) => item.id === variant.id) + 1 || index + 1;
      const personaReactions = personas.map((persona, personaIndex) => {
        const hash = hashString(`${audience}:${persona.name}:${persona.role}:${persona.priority}:${variant.id}:${variant.prompt}`);
        const score = 52 + (hash % 45);
        const reaction = reactionPhrases[(hash + personaIndex) % reactionPhrases.length];

        return {
          personaId: persona.id,
          personaName: persona.name,
          role: persona.role,
          score,
          reaction,
          reason: `${persona.name} is judging the image as a ${persona.role.toLowerCase()} who cares about ${persona.priority}. The ${variant.styleLabel.toLowerCase()} direction ${score >= 78 ? "gives them a clear reason to choose it" : score >= 66 ? "has usable appeal but still needs a sharper cue" : "does not make the buying moment obvious enough"}.`
        };
      });
      const score = Math.round(personaReactions.reduce((sum, reaction) => sum + reaction.score, 0) / personaReactions.length);
      const strongestPersona = personaReactions.reduce((best, reaction) => reaction.score > best.score ? reaction : best, personaReactions[0]);

      return {
        variantId: variant.id,
        imageNumber,
        label: variant.styleLabel || `Image ${imageNumber}`,
        score,
        reaction: `${strongestPersona.personaName} reacts strongest; average fit is ${score}.`,
        reason: `Across the three simulated personas, the ${variant.styleLabel.toLowerCase()} direction ${score >= 78 ? "has the clearest combined pull" : score >= 66 ? "is viable but less unanimously convincing" : "needs a clearer audience cue before it should lead"}.`,
        personaReactions
      };
    })
    .sort((a, b) => b.score - a.score);

  const top = rankings[0];

  return {
    audience,
    summary: top
      ? `${top.label} has the strongest average read with ${audience}. Open the image to compare each persona's reaction.`
      : `No finished images are available to simulate for ${audience}.`,
    personas,
    personaSource: input.personaSource ?? "mock",
    personaModel: input.personaModel ?? null,
    scoreSource: input.scoreSource ?? "mock",
    scoreModel: input.scoreModel ?? null,
    segments: segmentLabels.map((label, index) => ({
      label,
      take: top
        ? `${label} lean toward Image ${rankings[index % Math.max(rankings.length, 1)]?.imageNumber ?? top.imageNumber}.`
        : `${label} need finished images before reacting.`
    })),
    rankings
  };
}
