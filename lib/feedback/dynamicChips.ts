import type {
  BrandProfile,
  FeedbackOption,
  ImageVariant,
  ImageVariantMetadata,
  ThreadMacroMemory
} from "@/lib/feedback/types";

function option(label: string, source: FeedbackOption["source"]): FeedbackOption {
  return {
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    label,
    source
  };
}

function uniqueOptions(options: FeedbackOption[], limit = 9) {
  const seen = new Set<string>();
  return options.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, limit);
}

function categoryOptions(category: string, reaction: "like" | "dislike") {
  const value = category.toLowerCase();

  if (value.includes("bakery") || value.includes("pastry") || value.includes("coffee")) {
    return reaction === "like"
      ? [
          "warm morning bakery feel",
          "fresh-baked texture",
          "croissant as hero",
          "cozy local bakery mood",
          "simple social-post layout"
        ]
      : ["too polished", "too dark", "not breakfast-focused", "too childish", "missing fresh-baked texture"];
  }

  if (value.includes("food") || value.includes("beverage") || value.includes("restaurant")) {
    return reaction === "like"
      ? ["appetizing texture", "fresh ingredient cue", "craveable product focus", "social dining mood", "premium packaging cue"]
      : ["not appetite-led", "too generic food", "product feels flat", "wrong occasion", "missing freshness"];
  }

  if (value.includes("skin") || value.includes("beauty") || value.includes("cosmetic")) {
    return reaction === "like"
      ? ["gentle color palette", "soft human routine", "botanical ingredient cue", "calm neutral palette", "trustworthy product feel"]
      : ["too clinical", "too generic skincare", "product feels cheap", "not enough trust", "too sterile"];
  }

  if (value.includes("health") || value.includes("wellness") || value.includes("fitness")) {
    return reaction === "like"
      ? ["calm routine", "credible wellbeing cue", "natural lifestyle context", "supportive human moment", "balanced energy"]
      : ["feels unrealistic", "too medical", "not credible enough", "wrong energy level", "too generic wellness"];
  }

  if (value.includes("fashion") || value.includes("apparel")) {
    return reaction === "like"
      ? ["strong silhouette", "editorial styling", "premium fabric cue", "distinctive campaign energy", "clean lookbook framing"]
      : ["too trend-led", "wrong audience", "too stiff", "not premium enough", "weak product focus"];
  }

  if (value.includes("saas") || value.includes("software") || value.includes("tech")) {
    return reaction === "like"
      ? ["clear workflow story", "calm operator feel", "trustworthy interface mood", "clean product focus", "modern team context"]
      : ["too abstract", "not enough product", "too corporate", "unclear audience", "feels generic tech"];
  }

  if (value.includes("home") || value.includes("lifestyle") || value.includes("interior")) {
    return reaction === "like"
      ? ["lived-in warmth", "useful home context", "beautiful material detail", "calm everyday scene", "strong styling system"]
      : ["too staged", "wrong room mood", "not useful enough", "too cluttered", "missing lifestyle context"];
  }

  if (value.includes("entertainment") || value.includes("media") || value.includes("music") || value.includes("film")) {
    return reaction === "like"
      ? ["cinematic energy", "strong fan appeal", "memorable key art", "shareable social moment", "bold launch feel"]
      : ["too generic entertainment", "weak story hook", "not exciting enough", "wrong audience energy", "too poster-like"];
  }

  return reaction === "like"
    ? ["closer mood", "better subject focus", "stronger visual hierarchy", "more useful direction", "better brand fit"]
    : ["wrong audience", "too generic", "unclear subject", "off-goal", "wrong visual style"];
}

export function inferVariantMetadata(input: {
  label: string;
  prompt: string;
  brand?: BrandProfile | null;
}): ImageVariantMetadata {
  const text = `${input.label} ${input.prompt}`.toLowerCase();
  const subjects = [
    text.includes("croissant") || text.includes("pastry") ? "croissant focus" : null,
    text.includes("product") ? "product hero" : null,
    text.includes("lifestyle") || text.includes("human") ? "lifestyle moment" : null,
    text.includes("packaging") ? "packaging cue" : null,
    text.includes("botanical") || text.includes("ingredient") ? "ingredient cue" : null,
    text.includes("dashboard") || text.includes("workflow") ? "workflow context" : null
  ].filter((item): item is string => Boolean(item));
  const style = [
    text.includes("warm") || text.includes("morning") ? "warm" : null,
    text.includes("editorial") ? "editorial" : null,
    text.includes("premium") || text.includes("luxury") ? "premium" : null,
    text.includes("playful") || text.includes("bold") ? "playful" : null,
    text.includes("rustic") || text.includes("crafted") || text.includes("handmade") ? "rustic handmade" : null,
    text.includes("clinical") || text.includes("technical") ? "technical trust" : null
  ].filter((item): item is string => Boolean(item));
  const palette = [
    text.includes("neutral") || text.includes("calm") ? "calm neutral palette" : null,
    text.includes("bold") || text.includes("color") ? "confident color" : null,
    text.includes("earthy") || text.includes("warm") ? "earthy warm palette" : null,
    text.includes("soft") ? "soft light palette" : null
  ].filter((item): item is string => Boolean(item));

  return {
    visualSummary: input.label,
    subjects: subjects.length ? subjects : ["open subject direction"],
    style: style.length ? style : ["clean visual direction"],
    palette: palette.length ? palette : ["balanced palette"],
    composition: [
      text.includes("closeup") || text.includes("macro") ? "close crop" : "generous framing",
      text.includes("social") ? "social-post layout" : "image-led composition"
    ],
    brandFitStrengths: input.brand ? [`fits ${input.brand.goal}`, `speaks to ${input.brand.audience}`] : ["learns from thread feedback"],
    brandFitRisks: ["direction may be too broad"]
  };
}

export function generateFeedbackOptions(input: {
  brand: BrandProfile | null;
  variant: ImageVariant;
  reaction: "like" | "dislike";
  macroMemory: ThreadMacroMemory;
}): FeedbackOption[] {
  const { brand, variant, reaction, macroMemory } = input;
  const metadata = variant.metadata;
  const category = brand?.category ?? "";
  const categorySpecific = categoryOptions(category, reaction).map((label) => option(label, brand ? "brand" : "system"));
  const imageSpecific = [
    ...metadata.subjects,
    ...metadata.style,
    ...metadata.palette,
    ...metadata.composition,
    ...(reaction === "like" ? metadata.brandFitStrengths : metadata.brandFitRisks)
  ].map((label) => option(label, "image"));
  const historySpecific = (reaction === "like" ? macroMemory.preferredVisualTraits : macroMemory.avoidedVisualTraits).map((label) =>
    option(label, "history")
  );

  return uniqueOptions([...categorySpecific, ...imageSpecific, ...historySpecific]);
}
