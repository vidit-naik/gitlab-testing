---
title: Cases list shows zero result count when no cases exist
startUrl: /cases
checksumTestId: fR2wX
---

Covers the empty-state edge case of vidit7/agent-testing-crm-demo#4: when
there are no cases, the "Showing X of Y cases" line
(`data-testid="cases-result-count"`) still renders alongside the "No cases
found" message, reading "Showing 0 of 0 cases".

1. Log into the application.
2. Intercept `/api/cases` so it resolves to an empty list.
3. Open the Cases page.
4. Confirm the result-count line reads "Showing 0 of 0 cases".
5. Confirm the "No cases found" message is visible.
