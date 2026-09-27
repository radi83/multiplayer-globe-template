import { defineConfig, devices } from "@playwright/test";

/**
 * Duman testleri derlenmiş siteye karşı çalışır (npm run build sonrası).
 * Yerelde önceden kurulmuş bir Chromium kullanmak için:
 *   PW_CHROMIUM_PATH=/yol/chrome npm test
 */
const executablePath = process.env["PW_CHROMIUM_PATH"] || undefined;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  fullyParallel: true,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: "http://localhost:4173",
    launchOptions: { executablePath },
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env["CI"],
  },
  projects: [
    { name: "masaustu", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "telefon", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
});
