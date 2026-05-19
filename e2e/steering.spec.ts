import { test, expect, type TestDecision } from "./fixtures";

function decision(mode: TestDecision["mode"], nextOutputCount: TestDecision["nextOutputCount"] = 9): TestDecision {
  return {
    mode,
    nextOutputCount,
    promptIntent: `Intent for ${mode}.`,
    memoryUpdate: `Memory for ${mode}.`
  };
}

/**
 * The #1/#2 work plus recipe-coverage: a decision recorded on the parent must
 * reach the child's PlannerInput and resolve to the matching orchestration
 * recipe — through buildPlannerInput, exactly as runNode constructs it.
 */
test.describe("decision → recipe routing", () => {
  const cases: Array<[TestDecision["mode"], string, string]> = [
    ["refine", "narrow", "refine"],
    ["correct", "custom", "correct"],
    ["explore", "wide", "explore"],
    ["combine", "converge", "combine"],
    ["split", "wide", "split"],
    ["edit", "custom", "edit"],
    ["revise-goal", "wide", "revise_goal"],
    // Recipe-coverage fix: these used to fall back to the generic prompt.
    // Single-image regenerate is the dedicated recipe; a 9-count regenerate
    // is the pre-existing full-board regenerate_all_board path.
    ["regenerate", "regenerate", "regenerate"],
    ["save-direction", "narrow", "save_direction"]
  ];

  // Modes whose dedicated recipe only applies to a single-image next step.
  const singleImageModes = new Set(["regenerate", "save-direction"]);

  for (const [mode, childMode, expectedRecipe] of cases) {
    test(`${mode} → ${expectedRecipe}`, async ({ app }) => {
      const brandId = await app.createBrand();
      const { nodeId } = await app.startThread(brandId);
      await app.waitForBoard(nodeId);

      const board = await app.getNode(nodeId);
      await app.react(board!.doneVariantIds[0], "like", "this one worked");
      await app.react(board!.doneVariantIds[1], "dislike", "too commercial");

      const childId = await app.advance(
        nodeId,
        decision(mode, singleImageModes.has(mode) ? 1 : 9),
        childMode
      );

      expect(await app.recipeForNode(childId)).toBe(expectedRecipe);
    });
  }
});

/**
 * Ancestry-scoped trace memory (the C change): a like on an abandoned sibling
 * branch must NOT leak into a different branch's planner input.
 */
test("abandoned branch signals do not leak across branches", async ({ app }) => {
  const brandId = await app.createBrand();
  const { nodeId: rootBoard } = await app.startThread(brandId);
  await app.waitForBoard(rootBoard);

  // Branch A: generate its own board, like a variant *on that branch* with a
  // distinctive note, then abandon the branch. The signal lives on branch A,
  // not on the shared root board, so it must not reach a sibling branch.
  const branchA = await app.advance(rootBoard, {
    mode: "refine",
    nextOutputCount: 9,
    promptIntent: "Branch A refine.",
    memoryUpdate: "Branch A."
  }, "narrow");
  await app.waitForBoard(branchA);
  const aBoard = await app.getNode(branchA);
  await app.react(aBoard!.doneVariantIds[0], "like", "ABANDONED_BRANCH_SIGNAL");

  // Branch B: a separate child off the same root board, then a grandchild.
  const branchB = await app.advance(rootBoard, {
    mode: "explore",
    nextOutputCount: 9,
    promptIntent: "Branch B explore.",
    memoryUpdate: "Branch B."
  }, "wide");
  await app.waitForBoard(branchB);
  const bBoard = await app.getNode(branchB);
  await app.react(bBoard!.doneVariantIds[0], "like", "branch B keeper");
  const branchBChild = await app.advance(branchB, {
    mode: "refine",
    nextOutputCount: 9,
    promptIntent: "Branch B child.",
    memoryUpdate: "Branch B child."
  }, "narrow");

  const warm = await app.warmSignalsForNode(branchBChild);
  expect(warm.join(" | ")).not.toContain("ABANDONED_BRANCH_SIGNAL");
  expect(warm.join(" | ")).toContain("branch B keeper");
});
