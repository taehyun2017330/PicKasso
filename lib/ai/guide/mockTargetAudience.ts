import type {
  TargetAudienceSuggestion,
  TargetAudienceSuggestionInput,
  TargetAudienceSuggestionOutput
} from "@/lib/ai/guide/types";
import { hashString } from "@/lib/utils";

const presets: Record<string, Array<Omit<TargetAudienceSuggestion, "id">>> = {
  technology: [
    { label: "Early adopters", audience: "tech-forward founders and operators", rationale: "Good for product-led visuals." },
    { label: "Team buyers", audience: "ops teams choosing new tools", rationale: "Keeps the brief practical." },
    { label: "Power users", audience: "busy professionals who automate work", rationale: "Adds a clear usage context." },
    { label: "Technical leaders", audience: "IT and product decision makers", rationale: "Supports trust-led imagery." },
    { label: "Growing startups", audience: "lean teams scaling workflows", rationale: "Frames the product as momentum." }
  ],
  fashion: [
    { label: "Style seekers", audience: "trend-aware city shoppers", rationale: "Useful for campaign imagery." },
    { label: "Wardrobe upgraders", audience: "professionals refreshing everyday style", rationale: "Gives the brand a repeat-use context." },
    { label: "Quality buyers", audience: "shoppers who value fit and fabric", rationale: "Steers visuals toward material detail." },
    { label: "Drop followers", audience: "launch-driven fashion fans", rationale: "Fits social-first releases." },
    { label: "Minimal dressers", audience: "modern shoppers building capsule wardrobes", rationale: "Creates a focused aesthetic lane." }
  ],
  food: [
    { label: "Flavor explorers", audience: "curious eaters trying new favorites", rationale: "Supports craveable food visuals." },
    { label: "Busy lunch crowd", audience: "professionals choosing quick quality meals", rationale: "Adds a clear occasion." },
    { label: "Host-at-home buyers", audience: "people planning easy gatherings", rationale: "Works for spread and packaging shots." },
    { label: "Wellness snackers", audience: "shoppers seeking better everyday treats", rationale: "Balances freshness and appetite." },
    { label: "Local regulars", audience: "neighborhood customers building rituals", rationale: "Adds warmth and repeat use." }
  ],
  wellness: [
    { label: "Routine builders", audience: "people building healthier daily habits", rationale: "Keeps the brief supportive." },
    { label: "Active professionals", audience: "busy adults protecting energy and focus", rationale: "Gives the brand a practical need." },
    { label: "Mindful movers", audience: "wellness-minded fitness beginners", rationale: "Adds an approachable tone." },
    { label: "Recovery seekers", audience: "people prioritizing rest and balance", rationale: "Steers toward calm imagery." },
    { label: "Ingredient readers", audience: "shoppers comparing clean wellness products", rationale: "Supports trust and detail." }
  ],
  beauty: [
    { label: "Routine upgraders", audience: "beauty buyers refining daily rituals", rationale: "Fits product and routine imagery." },
    { label: "Ingredient-conscious", audience: "skincare shoppers reading labels", rationale: "Adds a trust cue." },
    { label: "Minimal makeup fans", audience: "people seeking polished everyday looks", rationale: "Keeps the visual direction clean." },
    { label: "Gift buyers", audience: "shoppers choosing premium self-care gifts", rationale: "Supports packaging and shelf scenes." },
    { label: "Texture testers", audience: "beauty fans drawn to product feel", rationale: "Works for macro product shots." }
  ],
  home: [
    { label: "Apartment refreshers", audience: "renters upgrading small spaces", rationale: "Gives visuals a relatable setting." },
    { label: "Design-minded hosts", audience: "people styling homes for gatherings", rationale: "Supports room and table scenes." },
    { label: "Practical decorators", audience: "families balancing function and style", rationale: "Keeps the brand grounded." },
    { label: "Material lovers", audience: "buyers who notice craft and texture", rationale: "Steers toward detail shots." },
    { label: "New homeowners", audience: "first-time homeowners shaping their space", rationale: "Creates a strong life-stage context." }
  ],
  entertainment: [
    { label: "Fan communities", audience: "fans who share launch moments", rationale: "Good for social-first creative." },
    { label: "Weekend planners", audience: "people choosing what to watch or attend", rationale: "Adds a clear decision moment." },
    { label: "Culture seekers", audience: "audiences following new releases", rationale: "Supports campaign energy." },
    { label: "Creator followers", audience: "fans invested in behind-the-scenes stories", rationale: "Works for narrative-led visuals." },
    { label: "Event goers", audience: "groups looking for memorable nights out", rationale: "Gives visuals a social setting." }
  ],
  default: [
    { label: "Best-fit buyers", audience: "people most likely to choose this brand", rationale: "A flexible starting point." },
    { label: "New customers", audience: "first-time shoppers comparing options", rationale: "Useful for clear brand introduction." },
    { label: "Repeat users", audience: "customers building a regular habit", rationale: "Supports lifestyle continuity." },
    { label: "Gift shoppers", audience: "buyers choosing something thoughtful", rationale: "Works across many categories." },
    { label: "Curious browsers", audience: "people exploring fresh alternatives", rationale: "Keeps discovery broad." }
  ]
};

const generalAlternates: Array<Omit<TargetAudienceSuggestion, "id">> = [
  { label: "Comparison shoppers", audience: "buyers comparing better options", rationale: "Good for clear value propositions." },
  { label: "Habit builders", audience: "people building a regular routine", rationale: "Supports repeat-use scenes." },
  { label: "Gift seekers", audience: "shoppers choosing thoughtful gifts", rationale: "Useful for packaging and occasion visuals." },
  { label: "Premium buyers", audience: "customers willing to pay for quality", rationale: "Steers toward elevated imagery." },
  { label: "First-time buyers", audience: "new customers learning the category", rationale: "Keeps the message approachable." },
  { label: "Community fans", audience: "people who share niche recommendations", rationale: "Works for social discovery." }
];

function categoryKey(category: string) {
  const value = category.toLowerCase();
  if (value.includes("fashion") || value.includes("apparel")) return "fashion";
  if (value.includes("food") || value.includes("beverage")) return "food";
  if (value.includes("health") || value.includes("wellness")) return "wellness";
  if (value.includes("beauty") || value.includes("cosmetic")) return "beauty";
  if (value.includes("home") || value.includes("lifestyle")) return "home";
  if (value.includes("entertainment")) return "entertainment";
  if (value.includes("tech")) return "technology";
  return "default";
}

export function createMockTargetAudienceSuggestions(
  input: TargetAudienceSuggestionInput,
  model: string | null = null
): TargetAudienceSuggestionOutput {
  const baseOptions = presets[categoryKey(input.category)] ?? presets.default;
  const options = [...baseOptions, ...generalAlternates].filter(
    (option, index, list) => list.findIndex((item) => item.audience === option.audience) === index
  );
  const seed = hashString(`${input.brandName}:${input.category}:${input.currentAudience ?? ""}:${input.rerollKey ?? 0}`);
  const start = seed % options.length;
  const suggestions = Array.from({ length: Math.min(5, options.length) }, (_, index) => {
    const suggestion = options[(start + index) % options.length];
    return {
      ...suggestion,
      id: `audience-${index + 1}-${suggestion.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`
    };
  });

  return { source: "mock", model, suggestions };
}
