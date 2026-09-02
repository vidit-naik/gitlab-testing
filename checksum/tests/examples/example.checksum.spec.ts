import { init } from "@checksum-ai/runtime";

// init() gives you the Checksum-aware Playwright helpers used below.
const { test, defineChecksumTest, login } = init();

test(defineChecksumTest("Open the home page", "TSTID"), async ({ page }) => {
  // login(page) uses the default environment and default user from checksum.config.ts.
  await login(page);

  await page.goto("/");
  // Wrap high-level or flaky flows with checksumAI when you want AI-assisted recovery.
});
