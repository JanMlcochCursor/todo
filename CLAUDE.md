# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # compile app.ts → app.js (tsc)
npm run watch          # tsc in watch mode
npm run serve          # python3 -m http.server 8000 (required for e2e tests)
npm run test:e2e       # run Playwright tests (auto-starts server)
npm run test:e2e:ui    # Playwright interactive UI
```

Run a single test file or by name:
```bash
npx playwright test tests/todo.spec.ts
npx playwright test -g "persists todos after reload"
```

## Architecture

This is a vanilla TypeScript single-page app with no framework or bundler. The entire logic lives in `app.ts`, which compiles to `app.js` via `tsc`. `index.html` loads `app.js` as an ES module.

**State model:** A single `todos: TodoItem[]` array is the source of truth. Every mutation (add/toggle/delete/clearCompleted) calls `saveTodos()` then `render()`, which rebuilds the entire `#todo-list` DOM from scratch.

**Persistence:** `localStorage` under key `todo-list-items`. On load, `loadTodos()` validates each entry with `isValidTodoItem` before accepting it.

**Theme:** Stored in `localStorage` under `todo-theme`. Falls back to `prefers-color-scheme`. Applied via `document.body.dataset.theme`.

**Tests:** Playwright e2e only (`tests/todo.spec.ts`). The config sets `baseURL: http://127.0.0.1:8000` and spins up `npm run serve` automatically. Each test clears `localStorage` in `beforeEach`.
