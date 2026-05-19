import { test, expect } from "./fixtures";

/**
 * Verifies the state-saving feature: structure persists to localStorage,
 * images rehydrate from the IndexedDB image cache, feedback survives, and an
 * interrupted in-flight node is settled (not left spinning) after a reload.
 */
test("trace, feedback and images survive a full page reload", async ({ app, page }) => {
  const brandId = await app.createBrand({ name: "Persisted Bakery" });
  const { threadId, nodeId } = await app.startThread(brandId);
  await app.waitForBoard(nodeId);

  const before = await app.getNode(nodeId);
  const likedId = before!.doneVariantIds[0];
  await app.react(likedId, "like", "keep this exact direction");

  // Image src should be populated before reload.
  const srcBefore = await page.evaluate((vid) => {
    const node = Object.values(window.__pickasso!.store.getState().nodes).find((n) =>
      n.variants.some((v) => v.id === vid)
    );
    return node?.variants.find((v) => v.id === vid)?.src ?? "";
  }, likedId);
  expect(srcBefore.length).toBeGreaterThan(0);

  // Hard reload — in-memory store is gone; only persisted snapshot + cache remain.
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__pickasso), null, { timeout: 30_000 });

  // Structure restored.
  await page.waitForFunction(
    (ids) => {
      const state = window.__pickasso!.store.getState();
      return (
        state.brands.some((b) => b.id === ids.brandId) &&
        state.threads.some((t) => t.id === ids.threadId) &&
        Boolean(state.nodes[ids.nodeId])
      );
    },
    { brandId, threadId, nodeId },
    { timeout: 20_000 }
  );

  const restored = await app.getNode(nodeId);
  expect(restored?.status).toBe("done");
  expect(restored?.variantIds.length).toBe(9);

  // Feedback survived.
  const feedback = await page.evaluate(
    (vid) => {
      const node = Object.values(window.__pickasso!.store.getState().nodes).find((n) =>
        n.variants.some((v) => v.id === vid)
      );
      return node?.variants.find((v) => v.id === vid)?.feedback ?? null;
    },
    likedId
  );
  expect(feedback?.rating).toBe("like");
  expect(feedback?.note).toBe("keep this exact direction");

  // Image src rehydrated from the IndexedDB image cache.
  await page.waitForFunction(
    (vid) => {
      const node = Object.values(window.__pickasso!.store.getState().nodes).find((n) =>
        n.variants.some((v) => v.id === vid)
      );
      const src = node?.variants.find((v) => v.id === vid)?.src ?? "";
      return src.length > 0;
    },
    likedId,
    { timeout: 20_000 }
  );
});

test("an interrupted in-flight node is settled after reload, not stuck", async ({ app, page }) => {
  const brandId = await app.createBrand();
  const { nodeId } = await app.startThread(brandId);

  // Reload immediately, while the first board is still queued/running.
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__pickasso), null, { timeout: 30_000 });

  await page.waitForFunction(
    (id) => Boolean(window.__pickasso!.store.getState().nodes[id]),
    nodeId,
    { timeout: 20_000 }
  );

  const node = await app.getNode(nodeId);
  expect(["error", "done", "idle"]).toContain(node?.status);
  expect(node?.status).not.toBe("queued");
  expect(node?.status).not.toBe("running");
});
