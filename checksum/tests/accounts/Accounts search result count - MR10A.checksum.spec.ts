import { init } from "@checksum-ai/runtime";
import { ACCOUNTS_PAGE_LOCATORS } from "../../locators/accounts-page.locators";

const { test, defineChecksumTest, login, expect, checksumAI, getEnvironment } = init();

test.describe("Accounts search result count", () => {
  const { environment } = getEnvironment({
    name: "production",
    userRole: "default",
  });

  test.use({ baseURL: environment.baseURL });

  test(
    defineChecksumTest("Shows matching and total account counts when searching", "MR10A"),
    async ({ page, vs }) => {
      vs.accountName = `cktest-result-count-account-${Date.now()}`;
      vs.unmatchedAccountSearch = `cktest-unmatched-account-${Date.now()}`;
      vs.accountsUrl = `${environment.baseURL}/accounts`;

      await checksumAI("Mock the Accounts response with one controlled account to verify search totals", async () => {
        await page.route("**/api/accounts", async (route) => {
          await route.fulfill({
            contentType: "application/json",
            body: JSON.stringify([
              {
                id: "cktest-result-count-account",
                name: vs.accountName,
                industry: "Technology",
                companySize: "Small (1-50)",
                owner: "Checksum Test",
                healthStatus: "Good",
                arr: 1000,
              },
            ]),
          });
        });
      });

      await checksumAI("Log into the production CRM to view account search results", async () => {
        await login(page, { environment: "production", role: "default" });
      });

      await checksumAI("Navigate to the Accounts page to inspect the search result summary", async () => {
        await page.goto(vs.accountsUrl, {
          waitUntil: "domcontentloaded",
        });
      });

      await expect(
        page.getByText(ACCOUNTS_PAGE_LOCATORS.loadingText, { exact: true }),
        "The account list should finish loading before its result totals are read"
      ).toBeHidden();

      await expect(
        page.getByTestId(ACCOUNTS_PAGE_LOCATORS.resultCount),
        "The Accounts page should show one displayed account and one total account below search"
      ).toHaveText("Showing 1 of 1 accounts");

      await checksumAI("Fill the Accounts search box with a unique unmatched name to filter the list", async () => {
        await page
          .getByPlaceholder(ACCOUNTS_PAGE_LOCATORS.searchInputPlaceholder)
          .fill(vs.unmatchedAccountSearch);
      });

      await expect(
        page.getByTestId(ACCOUNTS_PAGE_LOCATORS.resultCount),
        "The search summary should show zero matches while retaining the controlled account total"
      ).toHaveText("Showing 0 of 1 accounts");
    }
  );
});