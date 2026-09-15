import { init } from "@checksum-ai/runtime";
import { ACCOUNTS_PAGE_LOCATORS } from "../../locators/accounts-page.locators";
import {
  mockAccountSearchResults,
  removeMockedAccountSearchResults,
} from "./accounts-result-count.utils";

const { test, defineChecksumTest, expect, checksumAI, getEnvironment } = init();
const { environment, login } = getEnvironment({ name: "production" });

test.use({ baseURL: environment.baseURL });

test.afterEach(async ({ page }) => {
  await removeMockedAccountSearchResults(page, checksumAI);
});

test(
  defineChecksumTest(
    "Update the account result count when the search filter changes",
    "MR8ACCTFILTER"
  ),
  async ({ page, vs }) => {
    vs.matchingAccountName = `cktest-accounts-result-count-${Date.now()}-alpha`;
    vs.nonMatchingAccountName = `cktest-accounts-result-count-${Date.now()}-beta`;

    await mockAccountSearchResults(
      page,
      checksumAI,
      vs.matchingAccountName,
      vs.nonMatchingAccountName
    );

    await checksumAI("Log into the CRM to access the Accounts page", async () => {
      await login(page, { environment: environment.name });
    });

    await checksumAI(
      "Navigate to the Accounts page to filter the account search results",
      async () => {
        await page.goto("/accounts", { waitUntil: "domcontentloaded" });
      }
    );

    await checksumAI(
      "Fill the account search field with the matching test account name to narrow the results",
      async () => {
        await page
          .getByPlaceholder(ACCOUNTS_PAGE_LOCATORS.searchInputPlaceholder)
          .fill(vs.matchingAccountName);
      }
    );

    await expect(
      page.getByTestId(ACCOUNTS_PAGE_LOCATORS.resultCount),
      "Result count should update to one matching account while preserving the total account count"
    ).toHaveText("Showing 1 of 2 accounts");

    await expect(
      page.getByRole("link", { name: vs.matchingAccountName, exact: true }),
      "The matching account should remain visible after filtering"
    ).toBeVisible();
  }
);