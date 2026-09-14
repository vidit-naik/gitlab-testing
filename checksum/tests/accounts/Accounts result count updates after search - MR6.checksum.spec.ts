import { init } from "@checksum-ai/runtime";

const { test, defineChecksumTest, login, expect, checksumAI, getEnvironment } = init();
const { environment } = getEnvironment({ name: "production" });

test.use({ baseURL: environment.baseURL });

test.afterEach(async ({ page }) => {
  await page.unroute("**/api/accounts");
});

test(
  defineChecksumTest("Update the accounts result count after searching", "MR6"),
  async ({ page, vs }) => {
    vs.matchingAccountName = `cktest-result-match-${Date.now()}`;
    vs.nonMatchingAccountName = `cktest-result-other-${Date.now()}`;
    vs.searchTerm = vs.matchingAccountName;
    vs.accountsUrl = `${environment.baseURL}/accounts`;

    await test.step("Set up the accounts available to search", async () => {
      await page.route("**/api/accounts", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "cktest-result-match-id",
              name: vs.matchingAccountName,
              industry: "Technology",
              companySize: "51-200",
              owner: "Checksum",
              healthStatus: "Good",
              arr: 100000,
            },
            {
              id: "cktest-result-other-id",
              name: vs.nonMatchingAccountName,
              industry: "Retail",
              companySize: "1-50",
              owner: "Checksum",
              healthStatus: "Excellent",
              arr: 50000,
            },
          ]),
        });
      });
    });

    await test.step("View all available account results", async () => {
      await checksumAI("Sign in with the configured user to access the accounts list", async () => {
        await login(page);
      });

      await checksumAI("Navigate to the accounts page to view the available account results", async () => {
        await page.goto(vs.accountsUrl, { waitUntil: "domcontentloaded" });
      });

      await expect(
        page.getByTestId("accounts-result-count"),
        "Accounts result count should show every available account before searching"
      ).toHaveText("Showing 2 of 2 accounts");
    });

    await test.step("Search and clear the account results", async () => {
      await checksumAI("Fill the account search field to filter the list to the matching account", async () => {
        await page.getByPlaceholder("Search accounts...").fill(vs.searchTerm);
      });

      await expect(
        page.getByTestId("accounts-result-count"),
        "Accounts result count should show one matching account while preserving the total"
      ).toHaveText("Showing 1 of 2 accounts");

      await checksumAI("Fill the account search field with an unmatched term to remove all visible results", async () => {
        await page.getByPlaceholder("Search accounts...").fill("cktest-no-account-match");
      });

      await expect(
        page.getByTestId("accounts-result-count"),
        "Accounts result count should show zero matching accounts while preserving the total"
      ).toHaveText("Showing 0 of 2 accounts");

      await checksumAI("Clear the account search field to restore every available account", async () => {
        await page.getByPlaceholder("Search accounts...").clear();
      });

      await expect(
        page.getByTestId("accounts-result-count"),
        "Accounts result count should restore the full result count after clearing the search"
      ).toHaveText("Showing 2 of 2 accounts");
    });
  }
);
