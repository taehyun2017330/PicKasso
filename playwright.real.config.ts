import { defineConfig } from "@playwright/test";

const PORT = 3101;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * REAL OpenAI config. Hits the live API (paid). Models are remapped to real
 * IDs via env overrides. Single worker, generous timeouts (real image
 * generation is slow). Run explicitly:
 *   STAGE=board   npx playwright test --config playwright.real.config.ts
 *   STAGE=advance npx playwright test --config playwright.real.config.ts
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /real-(experiment|campaign|diverse)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 15 * 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "off",
    screenshot: "off"
  },
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      DEMO_USE_REAL_OPENAI: "true",
      NEXT_PUBLIC_E2E: "1",
      OPENAI_ORCHESTRATOR_MODEL: "o4-mini",
      OPENAI_IMAGE_MODEL: "gpt-image-1"
    }
  }
});
