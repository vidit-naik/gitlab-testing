---
title: Cases list shows result count that updates with status filter
startUrl: /cases
checksumTestId: cQ9Lp
---

Covers the change in vidit7/agent-testing-crm-demo#4: the Cases list renders
a "Showing X of Y cases" line (`data-testid="cases-result-count"`) under the
status filter, and the "X" count updates as the status filter changes.

1. Log into the application.
2. Intercept `/api/cases` so the list has a deterministic set of cases: 2
   "New", 1 "In Progress", 1 "Waiting", 1 "Closed".
3. Open the Cases page.
4. Confirm the result-count line reads "Showing 5 of 5 cases" while "All
   Statuses" is selected.
5. Filter the status dropdown to "New".
6. Confirm the result-count line updates to "Showing 2 of 5 cases".
7. Filter the status dropdown to "Waiting".
8. Confirm the result-count line updates to "Showing 1 of 5 cases".
9. Reset the status dropdown to "All Statuses".
10. Confirm the result-count line reverts to "Showing 5 of 5 cases".
