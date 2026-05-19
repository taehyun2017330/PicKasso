import fs from "node:fs";
import path from "node:path";

import { test, expect, type AppDriver } from "./real.fixtures";

/**
 * Diverse-like, slow-convergence campaign. Unlike the single-anchor campaign,
 * the simulated user is genuinely torn between TWO valid directions, likes
 * several images across both early, and only narrows over many generations.
 * This drives the split -> combine -> refine recipe path (not just refine)
 * and exercises multi-anchor reconciliation.
 */

const OUT = path.join(process.cwd(), "qa-runs", "real-exp", "diverse");

interface Phase {
  // how many of the top-by-facet-A and top-by-facet-B variants to LIKE
  likeA: number;
  likeB: number;
  mode: "split" | "combine" | "refine";
  childMode: "wide" | "converge" | "narrow";
  nextOutputCount: 4 | 9;
  intent: string;
}

interface Scenario {
  key: string;
  brand: { name: string; category: string; goal: string; targetAudience: string };
  facetA: { label: string; chips: string[]; kw: string[] };
  facetB: { label: string; chips: string[]; kw: string[] };
  antiKw: string[];
  antiChips: string[];
  // 4 actions across 5 generations
  phases: [Phase, Phase, Phase, Phase];
}

const SCENARIOS: Scenario[] = [
  {
    key: "D1-coffee-moody-vs-airy",
    brand: { name: "Ferro Coffee", category: "specialty coffee", goal: "espresso bar brand imagery", targetAudience: "urban coffee lovers" },
    facetA: { label: "moody dark editorial pour", chips: ["moody dark photo", "espresso pour", "deep shadow", "low key"], kw: ["moody", "dark", "espresso", "shadow", "low key", "steam"] },
    facetB: { label: "bright airy minimalist flat-lay", chips: ["bright airy", "minimal flat-lay", "soft daylight", "negative space"], kw: ["bright", "airy", "minimal", "flat-lay", "daylight", "negative space"] },
    antiKw: ["illustration", "poster", "text", "vector", "people", "collage"],
    antiChips: ["illustration", "text-heavy", "people"],
    phases: [
      { likeA: 1, likeB: 1, mode: "split", childMode: "wide", nextOutputCount: 9, intent: "Torn between a moody dark editorial pour and a bright airy minimalist flat-lay — explore both as parallel paths." },
      { likeA: 2, likeB: 1, mode: "combine", childMode: "converge", nextOutputCount: 4, intent: "The moody direction is winning but keep the airy cleanliness — combine the dark editorial pour with the negative-space restraint." },
      { likeA: 1, likeB: 0, mode: "refine", childMode: "narrow", nextOutputCount: 4, intent: "Refine the moody dark editorial espresso pour with clean negative space, deep shadow, steam, no text." },
      { likeA: 1, likeB: 0, mode: "refine", childMode: "narrow", nextOutputCount: 4, intent: "Tighten on the single best moody espresso pour; cinematic low-key, no text." }
    ]
  },
  {
    key: "D2-skincare-clinical-vs-botanical",
    brand: { name: "Sōl Apothecary", category: "skincare", goal: "serum line launch imagery", targetAudience: "design-literate millennials" },
    facetA: { label: "clinical cold minimalist still life", chips: ["clinical minimal", "cold neutral", "frosted glass", "negative space"], kw: ["clinical", "minimal", "cold", "neutral", "frosted", "negative space", "stone"] },
    facetB: { label: "warm organic botanical naturalistic", chips: ["organic botanical", "warm natural light", "fresh leaves", "earthy"], kw: ["botanical", "organic", "warm", "natural", "leaves", "earthy", "plant"] },
    antiKw: ["illustration", "poster", "text", "people", "3d render", "collage"],
    antiChips: ["illustration", "text-heavy", "people"],
    phases: [
      { likeA: 1, likeB: 1, mode: "split", childMode: "wide", nextOutputCount: 9, intent: "Undecided between a cold clinical minimalist still life and a warm organic botanical look — explore both paths." },
      { likeA: 1, likeB: 2, mode: "combine", childMode: "converge", nextOutputCount: 4, intent: "Leaning botanical but keep the minimalist restraint — combine the organic botanical warmth with clinical negative space." },
      { likeA: 0, likeB: 1, mode: "refine", childMode: "narrow", nextOutputCount: 4, intent: "Refine the warm organic botanical serum still life with restrained composition, no text." },
      { likeA: 0, likeB: 1, mode: "refine", childMode: "narrow", nextOutputCount: 4, intent: "Tighten on the single best warm botanical serum still life, soft natural light, no text." }
    ]
  },
  {
    key: "D3-sneaker-studio-vs-street",
    brand: { name: "Kestrel", category: "sneakers", goal: "drop campaign imagery", targetAudience: "streetwear youth" },
    facetA: { label: "hype saturated studio product", chips: ["studio product", "saturated gradient", "hard rim light", "crisp"], kw: ["studio", "product", "gradient", "rim light", "saturated", "crisp", "floating"] },
    facetB: { label: "gritty street lifestyle", chips: ["street lifestyle", "gritty urban", "concrete", "natural light"], kw: ["street", "gritty", "urban", "concrete", "asphalt", "lifestyle", "outdoor"] },
    antiKw: ["illustration", "poster", "text", "vintage", "watercolor", "collage"],
    antiChips: ["illustration", "text-heavy", "vintage"],
    phases: [
      { likeA: 1, likeB: 1, mode: "split", childMode: "wide", nextOutputCount: 9, intent: "Torn between a hype saturated studio product shot and a gritty street lifestyle look — explore both as parallel paths." },
      { likeA: 2, likeB: 1, mode: "combine", childMode: "converge", nextOutputCount: 4, intent: "Studio energy is winning but keep some street grit — combine the saturated studio product with an urban concrete edge." },
      { likeA: 1, likeB: 0, mode: "refine", childMode: "narrow", nextOutputCount: 4, intent: "Refine the hype saturated studio sneaker with hard rim light and an urban undertone, no text." },
      { likeA: 1, likeB: 0, mode: "refine", childMode: "narrow", nextOutputCount: 4, intent: "Tighten on the single best studio sneaker shot, crisp and saturated, no text." }
    ]
  }
];

function topByKw(
  variants: Array<{ id: string; prompt: string }>,
  kw: string[],
  exclude: Set<string>,
  n: number
): string[] {
  return [...variants]
    .filter((v) => !exclude.has(v.id))
    .map((v) => ({ id: v.id, s: kw.reduce((acc, k) => acc + (v.prompt.toLowerCase().includes(k) ? 1 : 0), 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((v) => v.id);
}

function ensureDir(d: string) {
  fs.mkdirSync(d, { recursive: true });
}

async function snapshot(driver: AppDriver, nodeId: string, dir: string) {
  ensureDir(dir);
  const variants = await driver.variants(nodeId);
  const orchestrator = await driver.orchestratorPrompt(nodeId).catch(() => null);
  variants.forEach((v, i) => {
    if (v.src.startsWith("data:image/")) {
      fs.writeFileSync(path.join(dir, `var-${i}-${v.id.slice(-6)}.png`), Buffer.from(v.src.split(",")[1] ?? "", "base64"));
    }
  });
  fs.writeFileSync(
    path.join(dir, "manifest.json"),
    JSON.stringify(
      { nodeId, recipe: orchestrator?.recipe, situation: orchestrator?.situation, orchestratorUser: orchestrator?.user, variants: variants.map((v, i) => ({ index: i, id: v.id, styleLabel: v.styleLabel, prompt: v.prompt })) },
      null,
      2
    )
  );
  return variants;
}

for (const sc of SCENARIOS) {
  test(`diverse ${sc.key}`, async ({ driver }) => {
    const scenarioDir = path.join(OUT, sc.key);
    ensureDir(scenarioDir);

    await driver.open();
    await driver.reset();
    const brandId = await driver.createBrand(sc.brand);
    const { nodeId: rootBoard } = await driver.startThread(brandId);
    await driver.waitForBoard(rootBoard, 13 * 60_000);

    let current = rootBoard;
    const recipes: string[] = [];

    for (let gen = 0; gen < 5; gen++) {
      const dir = path.join(scenarioDir, `gen-${gen}`);
      const variants = await snapshot(driver, current, dir);
      const recipe = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8")).recipe;
      recipes.push(recipe);
      // eslint-disable-next-line no-console
      console.log(`[${sc.key}] gen ${gen} recipe=${recipe} variants=${variants.length}`);

      if (gen === 4) break;
      const phase = sc.phases[gen];

      const exclude = new Set<string>();
      const likedA = topByKw(variants, sc.facetA.kw, exclude, phase.likeA);
      likedA.forEach((id) => exclude.add(id));
      const likedB = topByKw(variants, sc.facetB.kw, exclude, phase.likeB);
      likedB.forEach((id) => exclude.add(id));
      const disliked = topByKw(variants, sc.antiKw, exclude, 2);

      for (const id of likedA) await driver.react(id, "like", `Keep this: ${sc.facetA.label}.`, sc.facetA.chips);
      for (const id of likedB) await driver.react(id, "like", `Also like this: ${sc.facetB.label}.`, sc.facetB.chips);
      for (const id of disliked) await driver.react(id, "dislike", "Off-brand direction.", sc.antiChips);

      fs.writeFileSync(
        path.join(dir, "action.json"),
        JSON.stringify(
          {
            likedA: { ids: likedA, facet: sc.facetA.label, chips: sc.facetA.chips },
            likedB: { ids: likedB, facet: sc.facetB.label, chips: sc.facetB.chips },
            disliked: { ids: disliked, chips: sc.antiChips },
            decision: { mode: phase.mode, nextOutputCount: phase.nextOutputCount, promptIntent: phase.intent }
          },
          null,
          2
        )
      );

      current = await driver.advance(
        current,
        { mode: phase.mode, nextOutputCount: phase.nextOutputCount, promptIntent: phase.intent, memoryUpdate: phase.intent } as never,
        phase.childMode
      );
      await driver.waitForBoard(current, 13 * 60_000);
    }

    fs.writeFileSync(
      path.join(scenarioDir, "trajectory.json"),
      JSON.stringify({ scenario: sc.key, recipes, pattern: "diverse-likes / slow-convergence" }, null, 2)
    );
    // eslint-disable-next-line no-console
    console.log(`[${sc.key}] DONE recipes=${recipes.join(" → ")}`);
    expect(recipes.length).toBe(5);
  });
}
