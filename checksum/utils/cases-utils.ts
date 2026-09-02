import { IChecksumPage } from "@checksum-ai/runtime";

/**
 * Shape returned by the (real) `/api/cases` endpoint, as consumed by
 * apps/shell/app/cases/page.tsx. Only the fields the Cases list page reads
 * are modeled here.
 */
export interface CaseRecord {
  id: string;
  subject: string;
  status: "New" | "In Progress" | "Waiting" | "Closed";
  priority: "High" | "Medium" | "Low";
  accountId: string;
  contactId: string;
  account: { name: string };
  contact: { firstName: string; lastName: string };
  category: string;
  owner: string;
}

/**
 * Builds a deterministic set of cktest-prefixed case fixtures covering every
 * status the Cases page's filter dropdown exposes (New x2, In Progress x1,
 * Waiting x1, Closed x1), so filtering tests can assert exact counts per
 * status.
 */
export function buildCaseFixtures(): CaseRecord[] {
  const timestamp = Date.now();
  const account = { name: `cktest-account-${timestamp}` };
  const contact = { firstName: "cktest", lastName: `Contact${timestamp}` };
  const statuses: CaseRecord["status"][] = [
    "New",
    "New",
    "In Progress",
    "Waiting",
    "Closed",
  ];

  return statuses.map((status, index) => ({
    id: `cktest-case-${timestamp}-${index}`,
    subject: `cktest-case-${timestamp}-${index}`,
    status,
    priority: "Medium",
    accountId: `cktest-account-${timestamp}`,
    contactId: `cktest-contact-${timestamp}`,
    account,
    contact,
    category: "Support",
    owner: "cktest-owner",
  }));
}

/**
 * Intercepts the Cases page's `GET /api/cases` fetch and fulfills it with the
 * given records, bypassing the real backend entirely. Used to give the
 * result-count assertions deterministic data instead of depending on
 * whatever cases happen to already exist in the environment.
 */
export async function mockCasesList(
  page: IChecksumPage,
  cases: CaseRecord[]
): Promise<void> {
  await page.route("**/api/cases", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(cases),
    });
  });
}

/** Counts how many of the given cases have the provided status. */
export function countByStatus(
  cases: CaseRecord[],
  status: CaseRecord["status"]
): number {
  return cases.filter((c) => c.status === status).length;
}
