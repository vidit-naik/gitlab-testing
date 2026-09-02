// ESLint 9+ flat config for Checksum Playwright tests.
//
// Rules come from the shared, published checksumai-eslint-config package — the
// same config existing customers are auto-upgraded to via the platform's
// dependency-upgrade flow. Keeping fresh installs on the shared package means a
// brand-new project lints identically to an upgraded one (single source of
// truth), instead of drifting on a hand-rolled copy.
//
// Install the peer toolchain with:
//   npm i -D checksumai-eslint-config eslint typescript-eslint @eslint/js typescript
import { tests } from "checksumai-eslint-config";

export default [
  ...tests,
  {
    // Project-layout ignores live here (not in the shared package) because the
    // report directories and scratch REPL spec name are conventions of a
    // Checksum test repo's layout, not of the lint ruleset.
    ignores: [
      "test-results/",
      "playwright-report/",
      "blob-report/",
      "playwright/.cache/",
      // scratch REPL specs — both the dot-prefixed (.eval.checksum.spec.ts) and
      // any <name>.eval.checksum.spec.ts form (ESLint's `*` doesn't match a
      // leading dot, so both globs are needed).
      "**/.eval.checksum.spec.ts",
      "**/*.eval.checksum.spec.ts",
    ],
  },
];
