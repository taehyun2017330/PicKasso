import path from "node:path";
import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";

import { AppDriver } from "./fixtures";

export { expect } from "@playwright/test";
export { AppDriver };

const USER_DATA_DIR = path.join(process.cwd(), ".playwright", "real-profile");

/**
 * Real-mode harness. Uses a persistent browser profile so the trace
 * (localStorage) and the image cache (IndexedDB) survive between separate
 * `playwright test` invocations — that is what lets the experiment run as a
 * human-in-the-loop loop: generate, look at images, decide, continue.
 */
export const test = base.extend<{ context: BrowserContext; page: Page; driver: AppDriver }>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      viewport: { width: 1366, height: 900 }
    });
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    const page = context.pages()[0] ?? (await context.newPage());
    await use(page);
  },
  driver: async ({ page }, use) => {
    await use(new AppDriver(page));
  }
});
