import { RunMode, getChecksumConfig } from "@checksum-ai/runtime";
import * as path from "path";
import * as dotenv from "dotenv";

// Load env vars from the project-root .env first, then checksum/.env. The root
// is derived from this file's location (checksum/ lives at <project>/checksum),
// NOT from process.cwd(), so it resolves correctly no matter which directory
// Playwright/the CLI is launched from. dotenv does not overwrite variables that
// are already set, so the root .env wins on any overlapping key and
// checksum/.env only fills in the rest (and anything already exported in the
// real shell environment beats both files).
const projectRoot = path.join(__dirname, "..");
dotenv.config({ path: path.join(projectRoot, ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const BASE_URL = process.env.BASE_URL ?? "https://crm-gitlab-testing.vercel.app/";

export default getChecksumConfig({
  /**
   * Checksum Run mode. See Readme for more info
   */
  runMode: RunMode.Normal,

  /**
   * Define CHECKSUM_API_KEY in checksum/.env or your shell.
   * You can find it in https://app.checksum.ai/#/settings/
   */
  apiKey: process.env.CHECKSUM_API_KEY,

  /**
   * Define your test run environments and test users within each environment.
   * The environments must be aligned with those set here:
   * https://app.checksum.ai/#/settings/
   */
  environments: [
    {
      name: "production",
      baseURL: BASE_URL,
      loginURL: BASE_URL,
      default: true,
      users: [
        {
          // The demo CRM has no real accounts: its sign-in dialog accepts any
          // email + password and only sets a localStorage flag. The runtime
          // still requires one default user, so this placeholder exists for
          // that reason; override via CRM_USER_EMAIL / CRM_USER_PASSWORD.
          role: "default",
          username: process.env.CRM_USER_EMAIL ?? "checksum@example.com",
          password: process.env.CRM_USER_PASSWORD ?? "password",
          default: true,
        },
      ],
    },
  ],

  options: {
    /**
     * Recover from failing to locate an element for an action (see README)
     */
    useChecksumSelectors: true,
    /**
     * Recover from a failed action or assertion (see README)
     */
    useChecksumAI: { actions: true, assertions: false },
    /**
     * Whether to use mock API data when running your tests (see README)
     */
    useMockData: false,
    /**
     * Whether to Upload HTML test reports to app.checksum.ai so they can be viewed through the UI. Only relevant if Playwright reporter config is set to HTML
     * Reports will be saved locally either way (according to Playwright Configs) and can be viewed using the CLI command show-reports.
     */
    hostReports: !!process.env.CI,
    /**
     * Whether to create a PR with healed tests. Only relevant when in Heal mode.
     */
    autoHealPRs: !!process.env.CI,
  },
});
