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
    "Show the matching and total account counts in X of Y format",
    "MR8ACCTFORMAT"
  ),
  async ({ page, vs }) => {
    vs.matchingAccountName = `cktest-accounts-result-count-${Date.now()}-alpha`;
    vs.nonMatchingAccountName = `cktest-accounts-result-count-${Date.now()}-beta`;
    vs.noMatchSearchTerm = `cktest-accounts-result-count-${Date.now()}-missing`;

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
      "Navigate to the Accounts page to verify the result count format",
      async () => {
        await page.goto("/accounts", { waitUntil: "domcontentloaded" });
      }
    );

    await checksumAI(
      "Replace the account search with an unmatched term to verify the zero-match result count format",
      async () => {
        await page
          .getByPlaceholder(ACCOUNTS_PAGE_LOCATORS.searchInputPlaceholder)
          .fill(vs.noMatchSearchTerm);
      }
    );

    await expect(
      page.getByTestId(ACCOUNTS_PAGE_LOCATORS.resultCount),
      "Result count should show zero matching accounts and the full account total in X of Y format"
    ).toHaveText("Showing 0 of 2 accounts");
  }
);