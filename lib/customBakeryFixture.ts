import type { Brand, ImagePromptSituation, PlannerOutput } from "@/lib/types";
import { hashString } from "@/lib/utils";

export const customBakeryBrand = {
  name: "Crumb & Comet Bakehouse",
  category: "modern neighborhood bakery: sourdough, pastries, cakes, coffee",
  targetAudience:
    "urban Gen Z and millennial food lovers, young professionals, casual brunch shoppers, and design-conscious treat buyers"
};

export const customBakeryDirections = [
  {
    name: "Golden Window Morning",
    prompt_for_image_model:
      "[T] 1:1 sunlit bakery window editorial photo for Crumb & Comet Bakehouse. Flaky croissants, sourdough loaves, and coffee cups glowing in early morning light, cozy storefront reflections, soft steam. Centered window-display composition. No headline text. Warm natural photography, inviting neighborhood feel. Avoid logos, extra text, distorted food."
  },
  {
    name: "Cosmic Bread Poster",
    prompt_for_image_model:
      "[T] 1:1 risograph space-bakery poster for Crumb & Comet Bakehouse. A sourdough loaf becomes a glowing comet flying through stars, crumbs as planets, playful surreal energy. Bold diagonal composition. Exact readable text: \"FRESH FROM ORBIT\". Fluorescent orange, blue, cream, grainy print texture. Avoid realism, extra words, corporate polish."
  },
  {
    name: "Miniature Clay Bakehouse",
    prompt_for_image_model:
      "[T] 1:1 clay stop-motion bakery diorama for Crumb & Comet Bakehouse. Tiny handmade bakers rolling dough beside oversized buns, wonky shelves, frosting jars, soft studio shadows. Isometric tabletop composition. Exact readable text on small sign: \"CRUMB & COMET\". Charming tactile craft aesthetic. Avoid photoreal humans, extra text, slick CGI."
  },
  {
    name: "Dutch Master Pastry Table",
    prompt_for_image_model:
      "[T] 1:1 dramatic oil-painted pastry still life for Crumb & Comet Bakehouse. Dark wooden table with sourdough, berry tarts, braided challah, butter curls, flour dust, single beam of light. Classical triangular composition. No headline text. Baroque painting mood, deep browns, gold, crimson. Avoid modern packaging, cartoon style, extra text."
  },
  {
    name: "Brutalist Bread Stack",
    prompt_for_image_model:
      "[T] 1:1 brutalist bakery packaging concept for Crumb & Comet Bakehouse. Stacked bread bags, pastry boxes, and receipt tape arranged like architectural blocks, stark shadows, graphic labels. Grid-based front-facing composition. Exact readable text: \"DAILY BREAD\". Black, cream, red, raw paper texture. Avoid cozy cafe cliches, cursive fonts, extra text."
  },
  {
    name: "Late-Night Pastry Bar",
    prompt_for_image_model:
      "[T] 1:1 neon pastry bar scene for Crumb & Comet Bakehouse. Glazed donuts and eclairs under pink-blue neon, espresso reflections, city window at night, cinematic atmosphere. Low-angle counter composition with shallow depth of field. Exact readable text: \"OPEN LATE\". Moody nightlife photography. Avoid daylight, rustic styling, extra text."
  },
  {
    name: "Watercolor Picnic Story",
    prompt_for_image_model:
      "[T] 1:1 watercolor neighborhood picnic illustration for Crumb & Comet Bakehouse. Friends sharing cinnamon rolls, fruit tarts, and coffee on a park blanket, trees bending gently, dogs nearby. Loose circular composition around the food. No headline text. Soft pastel storybook style, wholesome and airy. Avoid hard outlines, photorealism, extra text."
  },
  {
    name: "Chrome Future Pastries",
    prompt_for_image_model:
      "[T] 1:1 futuristic 3D pastry lab render for Crumb & Comet Bakehouse. Levitating croissants, mirror-chrome trays, glass ovens, floating flour particles, impossible clean surfaces. Symmetrical sci-fi composition. No headline text. Sleek CGI, silver, lavender, electric white. Avoid rustic wood, people, handwritten text, messy clutter."
  },
  {
    name: "Sidewalk Social Collage",
    prompt_for_image_model:
      "[T] 1:1 street-style documentary collage for Crumb & Comet Bakehouse. Diverse young customers laughing outside a bakery, pastry close-ups, torn paper edges, sticker graphics, candid motion blur. Layered scrapbook composition. Exact readable text: \"MEET FOR A BITE\". Social-friendly urban collage aesthetic. Avoid staged corporate smiles, extra text, luxury styling."
  }
];

const customBakeryLatencySlots = [11000, 16500, 24000, 31500, 37000, 45500, 52000, 61000, 69000];

function normalize(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

export function isCustomBakeryBrand(brand: Brand | null | undefined) {
  if (!brand) return false;
  return normalize(brand.name) === normalize(customBakeryBrand.name);
}

export function shouldUseCustomBakeryFirstBoard(input: {
  brand: Brand | null | undefined;
  promptSituation?: ImagePromptSituation;
}) {
  return isCustomBakeryBrand(input.brand) && input.promptSituation === "first_generation_9";
}

export function customBakeryPlannerOutput(): PlannerOutput {
  return {
    nodeTitle: "First Directions",
    strategy: "Use the Crumb & Comet Bakehouse fixture for the first simulated bakery board.",
    traceSummary:
      "The first board is a preplanned nine-image visual spread that explores photography, poster art, clay craft, oil painting, packaging, nightlife, watercolor, CGI, and collage.",
    directions: customBakeryDirections.map((item, index) => ({
      label: item.name,
      prompt: item.prompt_for_image_model,
      description: customBakeryDescription(item.name),
      why: `Simulated bakery first-board prompt ${index + 1}.`,
      divergence: index < 4 ? "wide" : index < 7 ? "medium" : "narrow"
    }))
  };
}

export function customBakeryVariantFor(input: {
  brand: Brand | null | undefined;
  promptSituation?: ImagePromptSituation;
  index: number;
  seed?: string;
}) {
  if (!shouldUseCustomBakeryFirstBoard(input)) return null;
  const direction = customBakeryDirections[input.index];
  if (!direction) return null;

  return {
    src: `/custom/${input.index + 1}.png`,
    prompt: direction.prompt_for_image_model,
    styleLabel: direction.name,
    latencyMs: customBakeryLatencyFor(input.index, input.seed ?? customBakeryBrand.name)
  };
}

function customBakeryLatencyFor(index: number, seed: string) {
  const order = customBakeryDirections
    .map((_, variantIndex) => variantIndex)
    .sort((left, right) => hashString(`${seed}:bakery-order:${left}`) - hashString(`${seed}:bakery-order:${right}`));
  const slotIndex = Math.max(0, order.indexOf(index));
  const jitter = (hashString(`${seed}:bakery-jitter:${index}`) % 3200) - 1400;

  return Math.max(7000, (customBakeryLatencySlots[slotIndex] ?? 24000) + jitter);
}

function customBakeryDescription(name: string) {
  const descriptions: Record<string, string> = {
    "Golden Window Morning": "Warm editorial bakery-window photography with pastries, coffee, and morning neighborhood glow.",
    "Cosmic Bread Poster": "A playful risograph poster where bread becomes a comet in a graphic space scene.",
    "Miniature Clay Bakehouse": "A tactile stop-motion clay diorama with tiny bakers and handmade bakery details.",
    "Dutch Master Pastry Table": "A dramatic old-master pastry still life with rich shadows and classical food styling.",
    "Brutalist Bread Stack": "A stark packaging concept that turns bakery bags and boxes into architectural blocks.",
    "Late-Night Pastry Bar": "A moody neon pastry-counter scene with espresso reflections and city-night energy.",
    "Watercolor Picnic Story": "An airy neighborhood picnic illustration centered on pastries, coffee, and casual sharing.",
    "Chrome Future Pastries": "A sleek futuristic pastry-lab render with levitating croissants and chrome surfaces.",
    "Sidewalk Social Collage": "A street-style social collage of young customers, pastry details, and torn-paper motion."
  };

  return descriptions[name] ?? `${name} visual direction for Crumb & Comet Bakehouse.`;
}
