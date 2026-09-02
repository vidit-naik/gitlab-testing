import { ChecksumLoginFunction, IChecksumPage } from "@checksum-ai/runtime";
import * as path from "path";

// Shared with playwright.config.ts (storageState) so tests reuse this session.
const authFile = path.join(__dirname, ".auth");

// The demo CRM has no backend auth: a first visit shows a cookie-consent banner
// (rendered inside a closed shadow root, so Playwright locators cannot reach it)
// and a two-step Sign in dialog (email, then password) that accepts any values.
// Both only write localStorage flags (crm-consent / crm-authed).
const login: ChecksumLoginFunction = async (
  page: IChecksumPage,
  { environment, user }
) => {
  await page.goto(environment.loginURL ?? environment.baseURL);

  const dashboard = page.getByRole("heading", { name: "Dashboard", exact: true });
  const signInDialog = page.getByRole("dialog");

  // Already authenticated (storage state was reused) - just wait for the shell.
  const authed = await page.evaluate(
    () => localStorage.getItem("crm-authed") === "1"
  );
  if (authed) {
    await dashboard.waitFor({ state: "visible" });
    return;
  }

  // Dismiss the consent banner by pre-accepting it: its buttons live in a closed
  // shadow root and it intercepts pointer events over the sign-in dialog.
  await page.evaluate(() => localStorage.setItem("crm-consent", "accepted"));
  await page.reload();

  await signInDialog.getByRole("textbox").fill(user.username ?? "");
  await signInDialog.getByRole("button", { name: "Continue" }).click();
  await signInDialog.getByLabel("Password").fill(user.password ?? "");
  await signInDialog.getByRole("button", { name: "Sign in" }).click();

  await signInDialog.waitFor({ state: "hidden" });
  await dashboard.waitFor({ state: "visible" });

  await page.context().storageState({ path: authFile });
};

export default login;
