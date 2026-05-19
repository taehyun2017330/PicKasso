import { test, expect } from "./fixtures";

/**
 * Real-UI smoke: the app opens, a brand can be created through the wizard,
 * a thread starts, and the first 9-image board generates in mock mode.
 */
test("app opens and generates a first board", async ({ app, page }) => {
  // The empty state CTA opens the brand wizard.
  await page.getByRole("button", { name: /create brand/i }).first().click();

  await page.getByPlaceholder("Luna Bakery").fill("Mira Crust");
  await page.getByPlaceholder("Pick or type a category").fill("bakery");
  await page.getByPlaceholder(/Start typing or use AI Guide/i).fill("office commuters");
  await page.getByRole("button", { name: /^Create Brand$/ }).click();

  // Brand exists in the real store after the wizard submit.
  const brandId = await page.evaluate(
    () => window.__pickasso!.store.getState().brands[0]?.id ?? null
  );
  expect(brandId).toBeTruthy();

  const { nodeId } = await app.startThread(brandId as string);
  await app.waitForBoard(nodeId);

  const node = await app.getNode(nodeId);
  expect(node?.status).toBe("done");
  expect(node?.doneVariantIds.length).toBe(9);
});
