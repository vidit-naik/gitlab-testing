import { init } from "@checksum-ai/runtime";
import {
  buildCaseFixtures,
  countByStatus,
  mockCasesList,
} from "@checksum/utils/cases-utils";

const { test, defineChecksumTest, expect, checksumAI, getEnvironment } =
  init();

const { environment, login } = getEnvironment({ name: "production" });
test.use({ baseURL: environment.baseURL });

test(
  defineChecksumTest(
    "Cases list shows result count that updates with status filter",
    "cQ9Lp"
  ),
  async ({ page }) => {
    await checksumAI("Log into the application", async () => {
      await login(page);
    });

    const cases = buildCaseFixtures();
    const totalCount = cases.length;
    const newCount = countByStatus(cases, "New");
    const waitingCount = countByStatus(cases, "Waiting");

    await mockCasesList(page, cases);

    await checksumAI("Navigate to the Cases list page", async () => {
      await page.goto(environment.baseURL + "/cases");
    });

    const resultCount = page.getByTestId("cases-result-count");
    const statusFilter = page.getByRole("combobox");

    await expect(
      resultCount,
      "Result count should show all fixture cases when no status filter is applied"
    ).toHaveText(`Showing ${totalCount} of ${totalCount} cases`);

    await checksumAI(
      "Select 'New' in the status filter to narrow the cases list",
      async () => {
        await statusFilter.selectOption("New");
      }
    );

    await expect(
      resultCount,
      "Result count should reflect only the cases with status 'New' out of the total"
    ).toHaveText(`Showing ${newCount} of ${totalCount} cases`);

    await checksumAI(
      "Select 'Waiting' in the status filter to narrow the cases list further",
      async () => {
        await statusFilter.selectOption("Waiting");
      }
    );

    await expect(
      resultCount,
      "Result count should reflect only the cases with status 'Waiting' out of the total"
    ).toHaveText(`Showing ${waitingCount} of ${totalCount} cases`);

    await checksumAI(
      "Reset the status filter to 'All Statuses' to show every case again",
      async () => {
        await statusFilter.selectOption("all");
      }
    );

    await expect(
      resultCount,
      "Result count should revert to showing all fixture cases after clearing the status filter"
    ).toHaveText(`Showing ${totalCount} of ${totalCount} cases`);
  }
);
