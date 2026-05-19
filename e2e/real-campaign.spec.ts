import fs from "node:fs";
import path from "node:path";

import { test, expect, type AppDriver } from "./real.fixtures";

/**
 * Autonomous real-OpenAI steering campaign. 10 brand/target scenarios, each
 * driven through 5 iterative generations by a deterministic target-seeking
 * "user" (scores variant prompt text against the target, likes the best,
 * dislikes the worst, refines). Real images + the real orchestrator prompt
 * are saved every turn so convergence can be judged by eye afterward.
 */

const OUT = path.join(process.cwd(), "qa-runs", "real-exp", "campaign");
const GENERATIONS = 5;

interface Scenario {
  key: string;
  brand: { name: string; category: string; goal: string; targetAudience: string };
  targetDescription: string;
  targetChips: string[];
  targetKeywords: string[];
  antiChips: string[];
  antiKeywords: string[];
}

const SCENARIOS: Scenario[] = [
  {
    key: "01-skincare-clinical",
    brand: { name: "Sōl Apothecary", category: "skincare", goal: "launch a minimalist serum line", targetAudience: "design-literate millennials" },
    targetDescription: "Clinical minimalist still life of one frosted-glass serum bottle on a pale stone slab in soft diffuse daylight, lots of negative space, cool neutral palette, no people, no text",
    targetChips: ["minimalist still life", "frosted glass bottle", "pale stone", "soft diffuse daylight", "negative space", "no people"],
    targetKeywords: ["minimal", "still life", "bottle", "stone", "diffuse", "negative space", "neutral", "clinical"],
    antiChips: ["busy", "people", "vibrant", "illustration", "text-heavy"],
    antiKeywords: ["people", "model", "vibrant", "illustration", "poster", "text", "collage", "3d render"]
  },
  {
    key: "02-coffee-moody",
    brand: { name: "Ferro Coffee", category: "specialty coffee", goal: "espresso bar brand imagery", targetAudience: "urban coffee enthusiasts" },
    targetDescription: "Moody dark photographic close-up of espresso pulling into a ceramic cup, steam, warm low key light, deep shadows, no people, no text",
    targetChips: ["moody dark photo", "espresso pour", "steam", "low key warm light", "no people"],
    targetKeywords: ["moody", "dark", "espresso", "steam", "low key", "shadow", "ceramic", "photographic"],
    antiChips: ["bright flat", "graphic poster", "people", "illustration"],
    antiKeywords: ["bright", "flat", "poster", "people", "illustration", "watercolor", "text", "vector"]
  },
  {
    key: "03-sneaker-hype",
    brand: { name: "Kestrel", category: "sneakers", goal: "hype drop campaign", targetAudience: "streetwear youth" },
    targetDescription: "High-energy studio product shot of one sneaker floating on a bold saturated gradient background, hard rim light, crisp, no people, no text",
    targetChips: ["studio product shot", "floating sneaker", "saturated gradient", "hard rim light", "no people"],
    targetKeywords: ["studio", "product", "sneaker", "gradient", "rim light", "saturated", "crisp", "floating"],
    antiChips: ["muted", "people", "illustration", "vintage"],
    antiKeywords: ["muted", "people", "illustration", "vintage", "hand-drawn", "text", "collage"]
  },
  {
    key: "04-bookstore-cozy",
    brand: { name: "Margin", category: "independent bookstore", goal: "warm community brand imagery", targetAudience: "literary locals" },
    targetDescription: "Warm cozy photographic interior of a sunlit reading nook with stacked books and a worn armchair, golden afternoon light, no people, no text",
    targetChips: ["cozy interior photo", "sunlit reading nook", "stacked books", "golden afternoon light", "no people"],
    targetKeywords: ["cozy", "interior", "books", "nook", "golden", "sunlit", "armchair", "warm"],
    antiChips: ["cold clinical", "people", "graphic poster", "neon"],
    antiKeywords: ["clinical", "people", "poster", "neon", "vector", "text", "3d render"]
  },
  {
    key: "05-plant-airy",
    brand: { name: "Frond", category: "plant shop", goal: "airy houseplant brand imagery", targetAudience: "first-time plant owners" },
    targetDescription: "Airy bright photographic still life of a single potted monstera against a white wall with soft shadow play, lots of light, no people, no text",
    targetChips: ["airy bright photo", "potted monstera", "white wall", "soft shadow", "no people"],
    targetKeywords: ["airy", "bright", "monstera", "plant", "white wall", "shadow", "minimal", "still life"],
    antiChips: ["dark moody", "people", "illustration", "cluttered"],
    antiKeywords: ["dark", "moody", "people", "illustration", "cluttered", "text", "poster"]
  },
  {
    key: "06-jewelry-luxe",
    brand: { name: "Auré", category: "fine jewelry", goal: "luxury minimalist campaign", targetAudience: "affluent minimalists" },
    targetDescription: "Macro luxury photograph of a single gold ring on black velvet with a single hard spotlight and rich black negative space, no people, no text",
    targetChips: ["macro luxury photo", "gold ring", "black velvet", "single spotlight", "no people"],
    targetKeywords: ["macro", "luxury", "ring", "gold", "velvet", "spotlight", "black", "minimal"],
    antiChips: ["playful", "people", "illustration", "pastel"],
    antiKeywords: ["playful", "people", "illustration", "pastel", "cartoon", "text", "collage"]
  },
  {
    key: "07-ramen-vivid",
    brand: { name: "Tonkō", category: "ramen shop", goal: "appetite-driven menu imagery", targetAudience: "late-night food lovers" },
    targetDescription: "Vivid overhead photograph of one steaming ramen bowl on a dark slate table, rich saturated broth, garnish detail, dramatic light, no people, no text",
    targetChips: ["vivid overhead photo", "steaming ramen bowl", "dark slate", "saturated broth", "no people"],
    targetKeywords: ["overhead", "ramen", "bowl", "steam", "slate", "saturated", "broth", "photographic"],
    antiChips: ["pale flat", "people", "illustration", "graphic"],
    antiKeywords: ["pale", "flat", "people", "illustration", "graphic", "text", "vector"]
  },
  {
    key: "08-surf-sunfaded",
    brand: { name: "Saltgrain", category: "surf apparel", goal: "sun-faded lifestyle brand imagery", targetAudience: "coastal 20s" },
    targetDescription: "Sun-faded grainy film photograph of an empty beach with a single surfboard in dunes at golden hour, nostalgic warm grain, no people, no text",
    targetChips: ["sun-faded film photo", "empty beach", "single surfboard", "golden hour grain", "no people"],
    targetKeywords: ["film", "grain", "faded", "beach", "surfboard", "golden hour", "dunes", "nostalgic"],
    antiChips: ["crisp digital", "people", "studio", "graphic"],
    antiKeywords: ["crisp", "people", "studio", "graphic", "poster", "text", "3d render"]
  },
  {
    key: "09-stationery-pastel",
    brand: { name: "Leaflet", category: "stationery", goal: "soft pastel paper goods imagery", targetAudience: "journaling hobbyists" },
    targetDescription: "Soft pastel flat-lay photograph of paper goods arranged neatly on a pale pink surface, gentle even light, tidy negative space, no people, no text",
    targetChips: ["pastel flat-lay photo", "paper goods", "pale pink surface", "even light", "no people"],
    targetKeywords: ["pastel", "flat-lay", "paper", "pink", "even light", "tidy", "soft", "minimal"],
    antiChips: ["dark moody", "people", "3d render", "neon"],
    antiKeywords: ["dark", "moody", "people", "neon", "3d render", "text-heavy", "grunge"]
  },
  {
    key: "10-architecture-brutalist",
    brand: { name: "Béton", category: "architecture studio", goal: "brutalist portfolio imagery", targetAudience: "design press" },
    targetDescription: "Stark high-contrast photograph of a raw concrete brutalist facade under hard midday sun, strong geometric shadows, monochrome, no people, no text",
    targetChips: ["high-contrast photo", "raw concrete facade", "hard midday sun", "geometric shadow", "monochrome", "no people"],
    targetKeywords: ["concrete", "brutalist", "facade", "contrast", "geometric", "shadow", "monochrome", "stark"],
    antiChips: ["soft warm", "people", "illustration", "colorful"],
    antiKeywords: ["soft", "warm", "people", "illustration", "colorful", "text", "watercolor"]
  }
];

function score(promptText: string, sc: Scenario): number {
  const t = promptText.toLowerCase();
  const hit = sc.targetKeywords.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
  const miss = sc.antiKeywords.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
  return hit - miss;
}

function ensureDir(d: string) {
  fs.mkdirSync(d, { recursive: true });
}

async function captureBoard(
  driver: AppDriver,
  nodeId: string,
  dir: string,
  sc: Scenario
): Promise<{ best: { id: string; s: number }; worst: string[]; scores: number[] }> {
  ensureDir(dir);
  const variants = await driver.variants(nodeId);
  const orchestrator = await driver.orchestratorPrompt(nodeId).catch(() => null);
  const scored = variants.map((v) => ({ ...v, s: score(v.prompt, sc) }));
  scored.forEach((v, i) => {
    if (v.src.startsWith("data:image/")) {
      fs.writeFileSync(
        path.join(dir, `var-${i}-${v.id.slice(-6)}.png`),
        Buffer.from(v.src.split(",")[1] ?? "", "base64")
      );
    }
  });
  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify(
      {
        nodeId,
        recipe: orchestrator?.recipe,
        situation: orchestrator?.situation,
        orchestratorUser: orchestrator?.user,
        variants: scored.map((v, i) => ({ index: i, id: v.id, styleLabel: v.styleLabel, score: v.s, prompt: v.prompt }))
      },
      null,
      2
    )
  );
  const ranked = [...scored].sort((a, b) => b.s - a.s);
  return {
    best: { id: ranked[0].id, s: ranked[0].s },
    worst: ranked.slice(-3).map((v) => v.id),
    scores: scored.map((v) => v.s)
  };
}

for (const sc of SCENARIOS) {
  test(`campaign ${sc.key}`, async ({ driver, page }) => {
    const scenarioDir = path.join(OUT, sc.key);
    ensureDir(scenarioDir);

    await driver.open();
    await driver.reset();
    const brandId = await driver.createBrand(sc.brand);
    const { nodeId: rootBoard } = await driver.startThread(brandId);
    await driver.waitForBoard(rootBoard, 13 * 60_000);

    const trajectory: Array<{ gen: number; recipe?: string; bestScore: number; scores: number[] }> = [];
    let current = rootBoard;

    for (let gen = 0; gen < GENERATIONS; gen++) {
      const dir = path.join(scenarioDir, `gen-${gen}`);
      const { best, worst, scores } = await captureBoard(driver, current, dir, sc);
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
      trajectory.push({ gen, recipe: manifest.recipe, bestScore: best.s, scores });
      // eslint-disable-next-line no-console
      console.log(`[${sc.key}] gen ${gen} recipe=${manifest.recipe} bestScore=${best.s} scores=${scores.join(",")}`);

      if (gen === GENERATIONS - 1) break;

      const dislikedIds = worst.filter((wid) => wid !== best.id);
      fs.writeFileSync(
        path.join(dir, "action.json"),
        JSON.stringify(
          {
            liked: { id: best.id, chips: sc.targetChips },
            disliked: { ids: dislikedIds, chips: sc.antiChips },
            decision: { mode: "refine", nextOutputCount: 4, promptIntent: sc.targetDescription }
          },
          null,
          2
        )
      );

      await driver.react(
        best.id,
        "like",
        `This is the closest to the target: ${sc.targetDescription}.`,
        sc.targetChips
      );
      for (const wid of dislikedIds) {
        await driver.react(wid, "dislike", "Off-target for the intended direction.", sc.antiChips);
      }

      current = await driver.advance(
        current,
        {
          mode: "refine",
          nextOutputCount: 4,
          promptIntent: sc.targetDescription,
          memoryUpdate: `Steering toward: ${sc.targetDescription}`
        } as never,
        "narrow"
      );
      await driver.waitForBoard(current, 13 * 60_000);
    }

    fs.writeFileSync(
      path.join(scenarioDir, "trajectory.json"),
      JSON.stringify({ scenario: sc.key, target: sc.targetDescription, trajectory }, null, 2)
    );

    const first = trajectory[0].bestScore;
    const last = trajectory[trajectory.length - 1].bestScore;
    // eslint-disable-next-line no-console
    console.log(`[${sc.key}] DONE first=${first} last=${last} delta=${last - first}`);
    expect(trajectory.length).toBe(GENERATIONS);
  });
}
