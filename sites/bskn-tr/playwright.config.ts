import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  reporter: [["list"]],
  outputDir: "test-results",
  use: { baseURL: "http://localhost:4174", launchOptions: { executablePath } },
  webServer: { command: "npm run preview", url: "http://localhost:4174", reuseExistingServer: !process.env.CI },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 }, hasTouch: true } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
