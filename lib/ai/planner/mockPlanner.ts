import type { PlannerDirection, PlannerInput, PlannerOutput } from "@/lib/types";
import { describePromptForUser } from "@/lib/ai/promptOrchestrator";
import { compactText, hashString, seededItem } from "@/lib/utils";

const categoryDirectionSets: Record<string, string[]> = {
  technology: [
    "calm operator dashboard",
    "connected product ecosystem",
    "technical trust system",
    "data clarity vignette",
    "human workflow moment"
  ],
  food: [
    "fresh product spread",
    "sensory ingredient closeup",
    "beverage ritual detail",
    "packaging shelf hero",
    "hosting table moment"
  ],
  wellness: [
    "calm daily ritual",
    "mindful movement scene",
    "restorative product detail",
    "natural routine moment",
    "trust-first wellbeing cue"
  ],
  beauty: [
    "clean botanical ritual",
    "premium vanity shelf",
    "shade and texture study",
    "ingredient-led macro",
    "soft application moment"
  ],
  home: [
    "lived-in room vignette",
    "crafted material detail",
    "warm hosting scene",
    "shelf styling system",
    "functional lifestyle setup"
  ],
  entertainment: [
    "cinematic key art",
    "fan moment campaign",
    "marquee launch visual",
    "behind-the-scenes energy",
    "social teaser scene"
  ],
  bakery: [
    "morning pastry ritual",
    "butter-warm closeups",
    "soft counter still life",
    "neighborhood window glow",
    "crafted box packaging"
  ],
  fashion: [
    "editorial street set",
    "atelier fabric study",
    "quiet luxury catalog",
    "bold drop campaign",
    "movement and silhouette"
  ],
  saas: [
    "calm operator dashboard",
    "team workflow moment",
    "technical trust system",
    "data clarity vignette",
    "founder-led product scene"
  ],
  skincare: [
    "clean botanical ritual",
    "clinical premium shelf",
    "water-light texture study",
    "ingredient-led macro",
    "soft morning vanity"
  ],
  coffee: [
    "cafe social table",
    "roaster craft detail",
    "early commute cup",
    "warm menu board set",
    "beans and ceramic still life"
  ],
  education: [
    "focused learner desk",
    "bright modular classroom",
    "progress map system",
    "mentor feedback moment",
    "playful knowledge cards"
  ],
  default: [
    "minimal product hero",
    "warm lifestyle scene",
    "precise material study",
    "bold graphic campaign",
    "quiet editorial system"
  ]
};

const visualLenses = [
  "restrained, high-end, editorial composition",
  "soft natural light with tactile surface detail",
  "clear commercial framing with generous negative space",
  "distinctive graphic rhythm and confident color blocking",
  "human-scale lifestyle realism without stock-photo polish",
  "studio-lit premium object photography",
  "airy, calm, modern campaign direction",
  "more unexpected art-direction with practical brand use"
];

function resolveCategoryKey(category: string) {
  const value = category.toLowerCase();
  if (value.includes("bakery") || value.includes("pastry")) return "bakery";
  if (value.includes("fashion") || value.includes("apparel") || value.includes("clothing")) return "fashion";
  if (value.includes("food") || value.includes("beverage") || value.includes("restaurant")) return "food";
  if (value.includes("saas") || value.includes("software") || value.includes("tech")) return "technology";
  if (value.includes("health") || value.includes("wellness") || value.includes("fitness")) return "wellness";
  if (value.includes("skin") || value.includes("beauty") || value.includes("cosmetic")) return "beauty";
  if (value.includes("home") || value.includes("lifestyle") || value.includes("interior")) return "home";
  if (value.includes("entertainment") || value.includes("media") || value.includes("music") || value.includes("film")) {
    return "entertainment";
  }
  if (value.includes("coffee") || value.includes("cafe") || value.includes("roaster")) return "coffee";
  if (value.includes("education") || value.includes("learning") || value.includes("school")) return "education";
  return "default";
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
}

function divergenceForMode(mode: PlannerInput["actionMode"], index: number): PlannerDirection["divergence"] {
  if (mode === "narrow") return index < 3 ? "narrow" : "medium";
  if (mode === "converge") return index < 2 ? "medium" : "narrow";
  if (mode === "regenerate") return index < 2 ? "wide" : "medium";
  if (mode === "custom") return index === 0 ? "narrow" : "medium";
  return index < 3 ? "wide" : "medium";
}

export function mockPlanTraceNode(input: PlannerInput): PlannerOutput {
  const category = input.brand?.category || "open visual exploration";
  const categoryKey = resolveCategoryKey(category);
  const baseDirections = categoryDirectionSets[categoryKey] ?? categoryDirectionSets.default;
  const selectedLabel = input.selectedVariants.map((variant) => variant.styleLabel).join(", ");
  const warm = input.traceMemory.warmSignals.join("; ");
  const cold = input.traceMemory.coldSignals.join("; ");
  const custom = input.userPrompt || input.traceMemory.customSteers.at(-1) || "";
  const seedBase = `${input.seed}:${category}:${input.actionMode}:${selectedLabel}:${custom}:${warm}:${cold}`;
  const start = hashString(seedBase) % baseDirections.length;

  const outputCount = input.outputCount ?? 4;
  const directions = Array.from({ length: outputCount }, (_, index): PlannerDirection => {
    const base = baseDirections[(start + index) % baseDirections.length];
    const lens = seededItem(visualLenses, seedBase, index);
    const label = titleCase(base);
    const brandConstraint = input.brand
      ? `Fit ${input.brand.name}'s ${input.brand.goal}`
      : "Do not apply brand pillars; learn only from this thread's feedback.";
    const promptParts = [
      `${label} for ${input.brand?.name || "an unbranded exploration"}`,
      lens,
      input.brand ? `category: ${input.brand.category}` : "category: open-ended image direction",
      input.brand ? `goal: ${input.brand.goal}` : null,
      input.brand ? `audience: ${input.brand.targetAudience}` : null,
      selectedLabel ? `reference direction: ${selectedLabel}` : null,
      warm ? `move warmer toward: ${compactText(warm, 130)}` : null,
      cold ? `avoid colder signals: ${compactText(cold, 120)}` : null,
      custom ? `explicit steer: ${custom}` : null,
      "social-media-ready square image direction, no readable text, no logo usage"
    ].filter(Boolean);

    return {
      label,
      prompt: promptParts.join(". "),
      description: describePromptForUser(promptParts.join(". "), label),
      why:
        index === 0
          ? `${brandConstraint} This is the cleanest read on the current warm signal.`
          : `Tests a ${divergenceForMode(input.actionMode, index)} move against the current hot/cold memory.`,
      divergence: divergenceForMode(input.actionMode, index)
    };
  });

  const nodeTitle =
    input.actionMode === "converge"
      ? "Combined Direction"
      : input.actionMode === "narrow"
        ? "Zone In"
        : input.actionMode === "custom"
          ? "Custom Steer"
          : input.actionMode === "regenerate"
            ? "Regenerated Set"
            : "First Directions";

  return {
    nodeTitle,
    strategy: input.brand
      ? `Use ${input.brand.name} as the root constraint and treat liked variants as warmer visual evidence.`
      : "Run without brand constraints; only in-thread feedback changes the search direction.",
    traceSummary: [
      input.traceMemory.ancestrySummary,
      input.traceMemory.warmSignals.length ? `Warm: ${input.traceMemory.warmSignals.slice(-3).join("; ")}` : "Warm: none yet.",
      input.traceMemory.coldSignals.length ? `Cold: ${input.traceMemory.coldSignals.slice(-3).join("; ")}` : "Cold: none yet."
    ].join(" "),
    directions
  };
}
