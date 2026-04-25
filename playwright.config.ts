import { defineConfig, devices } from "@playwright/test";

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  "https://fitaipro-five.vercel.app";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,            // ← increased for auth tests
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    // Custom reporter that shows the blocking message
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "on",          // always take screenshots
    headless: true,
    extraHTTPHeaders: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});