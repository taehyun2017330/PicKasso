# E2E test system

Drives the real app in a browser to check that the features we build actually
work. Runs Next in **mock mode** (no OpenAI key, fast fake image latency), so
it is deterministic and free.

## How it works

`<E2EBridge />` (enabled only when `NEXT_PUBLIC_E2E=1`) attaches the live
Zustand store and the real steering functions to `window.__pickasso`. Tests
drive and assert through that bridge, so a green test means the shipped code
path works — not a copy of it. `buildPlannerInput` is the same function
`runNode` uses to build the planner request, so recipe assertions exercise the
real construction.

`playwright.config.ts` starts the dev server on port 3100 with the test env;
no manual setup beyond installing the browser once.

## Run

```bash
npx playwright install chromium   # one time
npm run test:e2e                  # all specs, headless
npm run test:e2e:ui               # interactive runner
npm run test:e2e:headed           # watch it click through the app
npx playwright test e2e/persistence.spec.ts   # one file
```

## Specs

- `smoke.spec.ts` — opens the app, creates a brand through the wizard UI,
  starts a thread, generates the first 9-image board.
- `steering.spec.ts` — every decision mode routes to its orchestration recipe
  (incl. the `regenerate` / `save-direction` coverage fix), and abandoned
  sibling-branch signals do not leak into another branch's planner input.
- `persistence.spec.ts` — trace structure, feedback and images survive a hard
  reload; an interrupted in-flight node is settled instead of stuck spinning.

## Adding a check

Add a `*.spec.ts` here and use the `app` fixture from `./fixtures`. Extend
`AppDriver` for new store interactions; expose new read-only helpers on
`window.__pickasso` via `components/app/E2EBridge.tsx` if a spec needs data the
driver can't reach yet.
