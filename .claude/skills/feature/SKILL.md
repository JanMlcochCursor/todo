---
name: feature
description: Implement a user-facing feature in this todo app, always followed by Playwright e2e tests.
---

Implement the requested feature, then immediately write Playwright e2e tests for it — do not ask, do not skip.

## Steps

1. Implement the feature in `app.ts` and `index.html` (and `styles.css` if needed)
2. Run `npx tsc` and fix any type errors
3. Add e2e tests to the appropriate file in `tests/`:
   - `todo.spec.ts` — core CRUD behaviour
   - `visibility.spec.ts` — show/hide done items
   - `theme.spec.ts` — theme toggling
   - Create a new spec file if the feature doesn't fit any of the above
4. Run `npx playwright test` to verify all tests pass

## Test conventions

- Clear `localStorage` in `beforeEach` via `page.evaluate(() => localStorage.clear())` followed by `page.reload()`
- Use role/label selectors (`getByRole`, `getByPlaceholder`) over CSS selectors where possible
- Cover: happy path, edge cases, and any persistent state (reload after action)

Feature to implement: $ARGUMENTS
