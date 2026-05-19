import { test, expect, type TestDecision } from "./fixtures";

/**
 * Steering experiment, not a pass/fail unit. Drives a realistic trajectory
 * toward one concrete target image and prints the REAL orchestrator prompt at
 * each turn so we can judge whether intent is faithfully carried, then assert
 * the load-bearing expectations so regressions are caught.
 *
 * Target image:
 *   Quiet matte editorial close-up of a hand-torn croissant on raw linen in
 *   cold north-window light. No people. No glossy commercial product-shot
 *   lighting. Muted oat/cream palette.
 */

const TARGET_CHIPS = [
  "matte texture",
  "cold north-window light",
  "no people",
  "oat-cream palette",
  "hand-torn edges"
];
const OFF_TARGET_GLOSSY = ["glossy", "commercial product-shot", "hard studio lighting"];
const OFF_TARGET_PEOPLE = ["people in frame", "lifestyle staging"];

function section(prompt: string, header: string): string {
  const lines = prompt.split("\n");
  const start = lines.findIndex((l) => l.trim() === header);
  if (start === -1) return `«${header}» NOT FOUND`;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^[A-Z][A-Z (]{3,}$/.test(l.trim()) && l.trim().length > 4);
  return rest.slice(0, end === -1 ? 6 : end).join("\n").trim();
}

function dump(label: string, p: { situation: string; recipe: string; user: string }) {
  const headers = [
    "USER INTENT",
    "LIKED ANCHOR",
    "REJECTED REFINEMENT",
    "PRIOR WARM SIGNAL TO RESTORE",
    "SAVED DIRECTION (the locked anchor)",
    "WARM TRAITS TO PRESERVE",
    "WARM TRAITS THAT DEFINE THIS DIRECTION",
    "COLD TRAITS TO AVOID"
  ];
  const blocks = headers
    .map((h) => `  ${h}\n    ${section(p.user, h).replace(/\n/g, "\n    ")}`)
    .filter((b) => !b.includes("NOT FOUND"));
  // eslint-disable-next-line no-console
  console.log(
    `\n===== ${label} =====\nsituation=${p.situation} recipe=${p.recipe}\n${blocks.join("\n")}\n`
  );
}

test("steer Mira Crust toward a matte editorial croissant", async ({ app }) => {
  const brandId = await app.createBrand({
    name: "Mira Crust",
    category: "bakery",
    goal: "matte editorial bakery imagery, quiet and craft-led",
    targetAudience: "design-literate independent cafe owners"
  });
  const { nodeId: rootBoard } = await app.startThread(brandId);
  await app.waitForBoard(rootBoard);
  const board = (await app.getNode(rootBoard))!;

  // Turn 0: react to the first board the way a user chasing the target would.
  await app.react(
    board.doneVariantIds[0],
    "like",
    "matte hand-torn croissant on raw linen in cold north-window light, no people",
    TARGET_CHIPS
  );
  await app.react(
    board.doneVariantIds[1],
    "dislike",
    "too glossy and slick, looks like a commercial product shot",
    OFF_TARGET_GLOSSY
  );
  await app.react(
    board.doneVariantIds[2],
    "dislike",
    "people holding pastries, staged lifestyle scene",
    OFF_TARGET_PEOPLE
  );

  // Decision text uses the user's own target words (this is what the real
  // decision engine would carry in promptIntent for a one-liked-rest-disliked
  // refine).
  const refine: TestDecision = {
    mode: "refine",
    nextOutputCount: 9,
    promptIntent:
      "Refine around the matte hand-torn croissant on raw linen in cold north light; keep it quiet and editorial, no people, no gloss.",
    memoryUpdate: "One matte editorial direction worked; glossy and lifestyle rejected."
  };
  const childA = await app.advance(rootBoard, refine, "narrow");
  const pA = await app.orchestratorPrompt(childA);
  dump("TURN 1 — refine after first board", pA);

  expect(pA.recipe).toBe("refine");
  // Hypothesis: target traits land as warm/anchor, off-target as cold.
  expect(pA.user).toMatch(/matte/i);
  expect(pA.user).toMatch(/cold north-window light/i);
  expect(pA.user).toMatch(/no people/i);
  expect(pA.user).toMatch(/glossy|commercial product-shot/i);

  // Turn 1: the refined board comes back but drifts glossy again; user rejects.
  await app.waitForBoard(childA);
  const aBoard = (await app.getNode(childA))!;
  await app.react(
    aBoard.doneVariantIds[0],
    "dislike",
    "it went glossy and commercial again, lost the matte linen texture",
    ["glossy", "lost matte texture"]
  );
  const correct: TestDecision = {
    mode: "correct",
    nextOutputCount: 4,
    promptIntent:
      "Correct back to the matte raw-linen cold-light look; remove the gloss that crept in.",
    memoryUpdate: "Refinement drifted glossy; restore the matte editorial signal."
  };
  const childB = await app.advance(childA, correct, "custom");
  const pB = await app.orchestratorPrompt(childB);
  dump("TURN 2 — correct after rejected refinement", pB);

  expect(pB.recipe).toBe("correct");
  expect(pB.user).toMatch(/REJECTED REFINEMENT/);
  // The thing we most want: the original target must still be recoverable here.
  const restoresTarget = /matte|raw linen|north light|hand-torn/i.test(pB.user);
  // eslint-disable-next-line no-console
  console.log(`TURN 2 still carries the original target traits: ${restoresTarget}`);
  expect(restoresTarget).toBe(true);

  // Turn 2: correction lands; user locks it in (save-direction).
  await app.waitForBoard(childB);
  const bBoard = (await app.getNode(childB))!;
  await app.react(
    bBoard.doneVariantIds[0],
    "like",
    "yes — this is the matte editorial croissant I wanted",
    TARGET_CHIPS
  );
  const save: TestDecision = {
    mode: "save-direction",
    nextOutputCount: 1,
    promptIntent: "Lock in the matte editorial hand-torn croissant on raw linen in cold light.",
    memoryUpdate: "User saved the matte editorial direction."
  };
  const childC = await app.advance(childB, save, "narrow");
  const pC = await app.orchestratorPrompt(childC);
  dump("TURN 3 — save-direction (consolidation)", pC);

  expect(pC.recipe).toBe("save_direction");
  expect(pC.user).toMatch(/matte|raw linen|hand-torn/i);
});
