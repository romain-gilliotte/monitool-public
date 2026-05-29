# Monitool — End-to-end tests (Playwright)

A small, self-contained E2E suite that drives the **real** application
(AngularJS frontend + Koa API + Bull workers + MongoDB + Redis). Its purpose is
to be a **safety net for migrating the frontend** off AngularJS / Bootstrap 3:
selectors are based on `data-testid` attributes, not on the DOM structure or CSS
classes, so the tests keep working as the markup changes.

> Scope: **E2E only** — no unit or integration tests.

## Requirements

- **Docker** (for MongoDB + Redis) — `docker compose` v2.
- **Node 22** (same as the services).
- Native binaries used by the **workers** for file generation (PDF/Excel/uploads):
  - `graphicsmagick` (`gm`) — **required** for the Excel/PDF download specs.
  - `ghostscript`, `libreoffice` — usually already present; needed for thumbnails.
  ```bash
  sudo apt-get install -y graphicsmagick ghostscript libreoffice
  ```
  These mirror the dependencies installed in `.devcontainer/Dockerfile`. The
  `compute-report` worker (used by spec 01 / general reporting) needs none of
  them; only downloads/uploads do.

## Install

```bash
cd e2e
npm install
npx playwright install chromium
```

## Run

```bash
npm test            # bring up infra, start the stack, run all specs
npm run test:headed # same, headed browser
npm run test:ui     # Playwright UI mode
npm run report      # open the last HTML report
```

`npm test` runs `scripts/infra.mjs up` first (idempotent), then Playwright:
- **`global-setup.js`** wipes user data + the reporting cache and seeds fixtures.
- **`webServer`** starts the `api`, `workers` and `frontend` (with the auth
  bypass on) and waits for `/health/*` to be green.

Backing services are **left running** between runs for speed. To stop them:

```bash
npm run infra:down       # docker compose down -v
# or: E2E_TEARDOWN=1 npm test   # tear down automatically after the run
```

## How auth is handled

Monitool authenticates through Auth0, which can't be exercised offline. The
harness enables an **opt-in, gated test mode** (never active in production):

- **Frontend** — `frontend/webpack.config.e2e.js` defines `AUTH_DISABLED`, and
  `frontend/src/index.js` then bypasses Auth0 and boots Angular with a fixed
  test profile (`e2e@monitool.test`). The branch is dead code (tree-shaken) in
  the normal dev/prod builds where `AUTH_DISABLED` is undefined.
- **API** — `MONITOOL_AUTH_DISABLED=TRUE` (set in `.env.e2e`) makes
  `api/src/middlewares/load-profile.js` skip JWT verification and the Auth0
  `/userinfo` lookup, using the same fixed test user.

`.env.e2e` contains only public config (the real Auth0 values are unused here)
and localhost connection strings — no secrets — so it is committed.

## Fixtures & determinism

`scripts/seed.mjs` (run by `global-setup`) inserts:
- the **test user** (so the API never auto-creates a duplicate demo project);
- the **Gondwana demo project** (reusing the API's own `insertDemoProject`) —
  used by the smoke spec; its dates float, so no numeric assertions are made;
- a **deterministic baseline project** (fixed ids, fixed 2020 dates, one monthly
  data source with a single partition-free variable, one goal-level indicator) —
  see `scripts/seed-baseline.mjs`.

Data-dependent specs reset/seed the baseline's inputs in `beforeEach` via
`helpers/db.mjs`, so they are order-independent.

## Scenarios

Each spec maps to a distinct user-doc use-case (no overlap):

| Spec | Doc area | What it checks |
|------|----------|----------------|
| `01-online-entry-to-reporting` | online data entry + general reporting | a value typed in the grid surfaces in the reporting table (UI → Mongo → worker → cell) |
| `02-datasource-excel-download` | Excel data entry (form generation) | downloads a real `.xlsx` data-entry form (worker `generate-form`) |
| `03-project-configuration` | initial project configuration | create a project, set basics, persist (round-trip) |
| `04-reporting-pivot` | pivot tables | a seeded value shows in the OLAP pivot |
| `05-demo-project-smoke` | the Gondwana project + navigation | demo project loads across its main screens without hitting the error state |

## `data-testid` convention

`<{zone}-{element}[-{business-id}]>`, kebab-case, language/CSS independent.
Lists use a stable business id, never a positional index — e.g.
`project-open-{projectId}`, `input-cell-{period}-{siteId}`,
`reporting-cell-{columnId}`, `download-link-{dataSourceId}xls`.

When migrating the frontend, keep these attributes on the equivalent new
elements and the suite stays valid.

## Notes

- The MongoDB replica set is required only because the app's `mongod` runs with
  `--replSet`; `scripts/infra.mjs` initiates it (host `localhost:27017`).
- The worker logs may show `roboto-fontface` font errors when generating PDF
  thumbnails — that's a pre-existing app issue (the font dependency was removed)
  unrelated to the harness; it does not affect the specs.
