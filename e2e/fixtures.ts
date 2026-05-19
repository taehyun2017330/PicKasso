import { test as base, expect, type Page } from "@playwright/test";

export { expect };

export type DecisionMode =
  | "refine"
  | "correct"
  | "explore"
  | "edit"
  | "regenerate"
  | "combine"
  | "split"
  | "revise-goal"
  | "save-direction";

export interface TestDecision {
  nextOutputCount: 1 | 4 | 9;
  mode: DecisionMode;
  promptIntent: string;
  memoryUpdate: string;
}

export interface NodeSnapshot {
  id: string;
  status: string;
  mode: string;
  variantIds: string[];
  doneVariantIds: string[];
}

const DEFAULT_BRAND = {
  name: "Mira Crust",
  category: "bakery",
  goal: "product imagery",
  targetAudience: "office commuters",
  toneChips: [] as string[],
  avoidNotes: ""
};

/**
 * Thin wrapper over window.__pickasso. Every method drives the real store /
 * real steering functions the app itself uses, so a passing test means the
 * shipped code path works — not a reimplementation of it.
 */
export class AppDriver {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto("/");
    await this.page.waitForFunction(() => Boolean(window.__pickasso), null, { timeout: 30_000 });
  }

  async reset() {
    await this.page.evaluate(() => window.__pickasso!.reset());
  }

  async createBrand(overrides: Partial<typeof DEFAULT_BRAND> = {}): Promise<string> {
    return this.page.evaluate(
      (brand) => window.__pickasso!.store.getState().createBrand(brand).id,
      { ...DEFAULT_BRAND, ...overrides }
    );
  }

  async startThread(brandId: string): Promise<{ threadId: string; nodeId: string }> {
    const result = await this.page.evaluate(
      (id) => window.__pickasso!.store.getState().startThread(id),
      brandId
    );
    if (!result) throw new Error("startThread returned null");
    return result;
  }

  async getNode(nodeId: string): Promise<NodeSnapshot | null> {
    return this.page.evaluate((id) => {
      const node = window.__pickasso!.store.getState().nodes[id];
      if (!node) return null;
      return {
        id: node.id,
        status: node.status,
        mode: node.mode,
        variantIds: node.variants.map((v) => v.id),
        doneVariantIds: node.variants.filter((v) => v.status === "done").map((v) => v.id)
      };
    }, nodeId);
  }

  async listNodes(): Promise<NodeSnapshot[]> {
    return this.page.evaluate(() =>
      Object.values(window.__pickasso!.store.getState().nodes).map((node) => ({
        id: node.id,
        status: node.status,
        mode: node.mode,
        variantIds: node.variants.map((v) => v.id),
        doneVariantIds: node.variants.filter((v) => v.status === "done").map((v) => v.id)
      }))
    );
  }

  /** Waits until a node's board has finished generating. */
  async waitForBoard(nodeId: string, timeoutMs = 45_000) {
    await this.page.waitForFunction(
      (id) => {
        const node = window.__pickasso!.store.getState().nodes[id];
        if (!node) return false;
        if (node.status === "error") throw new Error(`Node ${id} errored: ${node.error}`);
        return node.status === "done" && node.variants.length > 0;
      },
      nodeId,
      { timeout: timeoutMs }
    );
  }

  /** Full variant detail incl. image src — for saving real images to disk. */
  async variants(
    nodeId: string
  ): Promise<Array<{ id: string; styleLabel: string; prompt: string; src: string; status: string }>> {
    return this.page.evaluate((id) => {
      const node = window.__pickasso!.store.getState().nodes[id];
      return (node?.variants ?? []).map((v) => ({
        id: v.id,
        styleLabel: v.styleLabel,
        prompt: v.prompt,
        src: v.src,
        status: v.status ?? "unknown"
      }));
    }, nodeId);
  }

  async react(
    variantId: string,
    rating: "like" | "dislike" | "skip",
    note = "",
    reasonChips: string[] = []
  ) {
    await this.page.evaluate(
      ({ variantId, rating, note, reasonChips }) =>
        window.__pickasso!.store.getState().addFeedback(variantId, {
          rating,
          reasonChips,
          note
        }),
      { variantId, rating, note, reasonChips }
    );
  }

  async orchestratorPrompt(
    nodeId: string
  ): Promise<{ situation: string; recipe: string; user: string }> {
    const result = await this.page.evaluate(
      (id) => window.__pickasso!.orchestratorPromptForNode(id),
      nodeId
    );
    if (!result) throw new Error(`No orchestrator prompt for node ${nodeId}`);
    return result;
  }

  /** Records a decision on a node and forks a child that consumes it. */
  async advance(parentNodeId: string, decision: TestDecision, childMode: string): Promise<string> {
    return this.page.evaluate(
      ({ parentNodeId, decision, childMode }) => {
        const store = window.__pickasso!.store;
        store.getState().setTurnDecision(parentNodeId, decision, []);
        const parent = store.getState().nodes[parentNodeId];
        const child = store.getState().createChildNode({
          threadId: parent.threadId,
          parentNodeIds: [parentNodeId],
          parentVariantIds: parent.variants.map((v) => v.id),
          mode: childMode as never,
          userPrompt: decision.promptIntent,
          outputCount: decision.nextOutputCount
        });
        return child.id;
      },
      { parentNodeId, decision, childMode }
    );
  }

  async recipeForNode(nodeId: string): Promise<string | null> {
    return this.page.evaluate((id) => window.__pickasso!.recipeForNode(id), nodeId);
  }

  async warmSignalsForNode(nodeId: string): Promise<string[]> {
    return this.page.evaluate((id) => {
      const input = window.__pickasso!.plannerInputForNode(id);
      return input ? input.traceMemory.warmSignals : [];
    }, nodeId);
  }
}

export const test = base.extend<{ app: AppDriver }>({
  app: async ({ page }, use) => {
    const app = new AppDriver(page);
    await app.open();
    await app.reset();
    await use(app);
  }
});
