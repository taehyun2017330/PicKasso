import fs from "node:fs";
import path from "node:path";

import { test, expect, type AppDriver } from "./real.fixtures";

const OUT = path.join(process.cwd(), "qa-runs", "real-exp");
const STAGE = process.env.STAGE ?? "board";

interface ReactionInput {
  variantId: string;
  rating: "like" | "dislike" | "skip";
  note?: string;
  chips?: string[];
}
interface DecisionFile {
  parentNodeId: string;
  turn: number;
  reactions: ReactionInput[];
  decision: {
    mode: string;
    nextOutputCount: 1 | 4 | 9;
    promptIntent: string;
    memoryUpdate: string;
  };
  childMode: string;
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

async function dumpBoard(driver: AppDriver, nodeId: string, turnDir: string, label: string) {
  ensureDir(turnDir);
  const variants = await driver.variants(nodeId);
  const orchestrator = await driver.orchestratorPrompt(nodeId).catch(() => null);
  const manifest = variants.map((v, i) => {
    const short = v.id.slice(-6);
    const fileName = `var-${i}-${short}.png`;
    if (v.src.startsWith("data:image/")) {
      const b64 = v.src.split(",")[1] ?? "";
      fs.writeFileSync(path.join(turnDir, fileName), Buffer.from(b64, "base64"));
    }
    return { index: i, id: v.id, styleLabel: v.styleLabel, status: v.status, prompt: v.prompt, file: fileName };
  });
  writeJson(path.join(turnDir, "manifest.json"), { label, nodeId, orchestrator, variants: manifest });
  // eslint-disable-next-line no-console
  console.log(`\n[${label}] node=${nodeId}\nSaved ${manifest.length} images to ${turnDir}`);
  if (orchestrator) {
    // eslint-disable-next-line no-console
    console.log(`recipe=${orchestrator.recipe} situation=${orchestrator.situation}`);
  }
}

test("real steering experiment", async ({ driver, page }) => {
  ensureDir(OUT);

  if (STAGE === "board") {
    await driver.open();
    await driver.reset();
    // The brief is realistic and broad. The matte-editorial target is the
    // *user's* private goal, pushed only through feedback — not the brief.
    const brandId = await driver.createBrand({
      name: "Mira Crust",
      category: "artisan bakery",
      goal: "launch social images for an artisan sourdough & viennoiserie bakery",
      targetAudience: "design-literate independent cafe owners"
    });
    const { nodeId } = await driver.startThread(brandId);
    await driver.waitForBoard(nodeId, 13 * 60_000);
    await dumpBoard(driver, nodeId, path.join(OUT, "turn-0-board"), "FIRST BOARD");
    writeJson(path.join(OUT, "state.json"), { currentNodeId: nodeId, turn: 0 });
    return;
  }

  // STAGE=advance: resume from the persisted profile, apply the feedback I
  // authored after looking at the images, generate the next board.
  const decision = JSON.parse(
    fs.readFileSync(path.join(OUT, "decision.json"), "utf8")
  ) as DecisionFile;

  await driver.open();
  await page.waitForFunction(
    (id) => Boolean(window.__pickasso!.store.getState().nodes[id]),
    decision.parentNodeId,
    { timeout: 30_000 }
  );

  for (const r of decision.reactions) {
    await driver.react(r.variantId, r.rating, r.note ?? "", r.chips ?? []);
  }

  const childId = await driver.advance(decision.parentNodeId, decision.decision as never, decision.childMode);

  // Capture the exact steering instruction BEFORE the model runs.
  const prompt = await driver.orchestratorPrompt(childId);
  ensureDir(path.join(OUT, `turn-${decision.turn}`));
  writeJson(path.join(OUT, `turn-${decision.turn}`, "orchestrator.json"), prompt);
  // eslint-disable-next-line no-console
  console.log(`\n[ADVANCE] childMode recipe=${prompt.recipe}\n--- ORCHESTRATOR USER PROMPT ---\n${prompt.user}\n--- END ---`);

  await driver.waitForBoard(childId, 13 * 60_000);
  await dumpBoard(driver, childId, path.join(OUT, `turn-${decision.turn}`), `TURN ${decision.turn}`);
  writeJson(path.join(OUT, "state.json"), { currentNodeId: childId, turn: decision.turn });

  expect(prompt.recipe).toBeTruthy();
});
