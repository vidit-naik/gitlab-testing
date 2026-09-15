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
    "Display the total account count below the Accounts search field",
    "MR8ACCTCOUNT"
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
      "Navigate to the Accounts page to inspect the search result count",
      async () => {
        await page.goto("/accounts", { waitUntil: "domcontentloaded" });
      }
    );

    await expect(
      page.getByTestId(ACCOUNTS_PAGE_LOCATORS.resultCount),
      "Result count below the account search field should show all available accounts before a search is entered"
    ).toHaveText("Showing 2 of 2 accounts");
  }
);