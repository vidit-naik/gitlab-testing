import { init } from "@checksum-ai/runtime";
import { mockCasesList } from "@checksum/utils/cases-utils";

const { test, defineChecksumTest, expect, checksumAI, getEnvironment } =
  init();

const { environment, login } = getEnvironment({ name: "production" });
test.use({ baseURL: environment.baseURL });

test(
  defineChecksumTest(
    "Cases list shows zero result count when no cases exist",
    "fR2wX"
  ),
  async ({ page }) => {
    await checksumAI("Log into the application", async () => {
      await login(page);
    });

    await mockCasesList(page, []);

    await checksumAI("Navigate to the Cases list page", async () => {
      await page.goto(environment.baseURL + "/cases");
    });

    await expect(
      page.getByTestId("cases-result-count"),
      "Result count should read zero of zero when there are no cases to show"
    ).toHaveText("Showing 0 of 0 cases");

    await expect(
      page.getByText("No cases found"),
      "Empty state message should be visible alongside the zero result count"
    ).toBeVisible();
  }
);
