import { ChecksumAI, IChecksumPage } from "@checksum-ai/runtime";

export async function mockAccountSearchResults(
  page: IChecksumPage,
  checksumAI: ChecksumAI,
  matchingAccountName: string,
  nonMatchingAccountName: string
) {
  await checksumAI(
    "Mock two isolated account records to verify the search result count without changing shared account data",
    async () => {
      await page.route("**/api/accounts", async (route) => {
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "cktest-accounts-result-count-alpha",
              name: matchingAccountName,
              industry: "Technology",
              companySize: "Small",
              owner: "Checksum",
              healthStatus: "Good",
              arr: 1200,
            },
            {
              id: "cktest-accounts-result-count-beta",
              name: nonMatchingAccountName,
              industry: "Finance",
              companySize: "Medium",
              owner: "Checksum",
              healthStatus: "Excellent",
              arr: 2400,
            },
          ]),
        });
      });
    }
  );
}

export async function removeMockedAccountSearchResults(
  page: IChecksumPage,
  checksumAI: ChecksumAI
) {
  await checksumAI(
    "Remove the mocked account response to keep the account search test isolated",
    async () => {
      await page.unroute("**/api/accounts");
    }
  );
}