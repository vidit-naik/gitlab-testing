import { defineConfig, devices } from "@playwright/test";
import { PuppeteerExtraPlugin } from "puppeteer-extra-plugin";
import * as path from "path";
import * as dotenv from "dotenv";

// Load env vars from the project-root .env first, then checksum/.env (see the
// matching comment in checksum.config.ts for the precedence rules).
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

// Optional outbound proxy, e.g. for allow-listed egress IPs.
const proxy = process.env.PROXY_SERVER
  ? {
      server: process.env.PROXY_SERVER,
      username: process.env.PROXY_USERNAME,
      password: process.env.PROXY_PASSWORD,
    }
  : undefined;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<{ playwrightExtra?: PuppeteerExtraPlugin[] }>({
  testDir: "..",
  /* Set test timeout to 10 minutes (relatively long) as Checksum implements its own timeout mechanism */
  timeout: 1000 * 60 * 10,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter:
    process.env.CHECKSUM_SHARD_MODE === "true"
      ? [["blob", { outputDir: "blob-report" }], ["line"]]
      : process.env.CI
      ? [["html", { open: "never", outputFolder: "test-results" }], ["line"]]
      : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    trace:
      "on" /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */,
    video: "on",
    screenshot: "on",
    locale: "en-US",
    timezoneId: "UTC",
    permissions: ["clipboard-read", "clipboard-write"],
    actionTimeout: 1000 * 15, // set action timeout for 15 seconds
    navigationTimeout: 1000 * 60, // set navigation timeout for 60 seconds
    ...(proxy && { proxy }),
  },
  expect: {
    timeout: 1000 * 10, // set expect (assertion) timeout for 10 seconds
    toHaveScreenshot: { maxDiffPixelRatio: 0.05, maxDiffPixels: 200 },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      testMatch: /checksum.spec/,
      testIgnore: /example.checksum.spec.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Reuse the authenticated state saved by login.ts.
        storageState: path.join(__dirname, ".auth"),
        // To use playwright-extra plugins, import them and add them here
        // See https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra
        // Example:
        // import StealthPlugin from "puppeteer-extra-plugin-stealth";
        // playwrightExtra: [StealthPlugin()],
      },
    },
  ],
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
