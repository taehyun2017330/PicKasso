import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E config. The web server runs Next in deterministic mock mode (no OpenAI
 * key needed, fast fake image latency) with the test bridge enabled.
 */
export default defineConfig({
  testDir: "./e2e",
  testIgnore: /real-(experiment|campaign|diverse)\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Force deterministic mock generation regardless of .env.local.
      DEMO_USE_REAL_OPENAI: "false",
      MOCK_IMAGE_LATENCY_MS: "120",
      NEXT_PUBLIC_E2E: "1"
    }
  }
});
