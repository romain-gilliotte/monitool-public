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
  them; only downloads/uploads do. The **paper-form** spec additionally exercises
  the workers' OpenCV binding (`@techstark/opencv-js`, bundled in `workers/`) to
  parse the re-uploaded PDF — no extra host package, but it is the slowest spec.
  The Excel-upload spec uses `exceljs` (an e2e devDependency, installed by
  `npm install`).

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
  `frontend/src/index.js` then bypasses Auth0 and boots Angular with a test
  profile. The branch is dead code (tree-shaken) in the normal dev/prod builds
  where `AUTH_DISABLED` is undefined.
- **API** — `MONITOOL_AUTH_DISABLED=TRUE` (set in `.env.e2e`) makes
  `api/src/middlewares/load-profile.js` skip JWT verification and the Auth0
  `/userinfo` lookup, deriving the identity from the request instead.
- **Multi-account** — the identity is encoded in the fake token as
  `e2e:<email>` (defaulting to `e2e@monitool.test`). The Playwright fixture
  injects `window.__E2E_USER__` per browser context, so specs can run as a
  different user via `test.use({ userEmail })` or the `asUser(email)` fixture —
  used by the invitation spec to drive a real two-user flow.

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
| `06-config-sites` | sites | add / rename / group / delete sites on a fresh project |
| `06-datasource-authoring` | data source | create a data source with a variable, aggregation modes and a partition |
| `06-logframe-authoring` | logical framework | build a goal/purpose/output/activity tree + a copy-formula indicator |
| `06-extra-indicator-config` | indicators | add a cross-cutting extra indicator |
| `06-invitations-multiaccount` | invite other users | owner invites + revokes; a 2nd identity accepts and gains access |
| `06-multipartition-entry-to-reporting` | disaggregated data entry | drive an NxM Handsontable; the partition sum surfaces in reporting |
| `06-input-prefill` | online data entry | prefill with zeros / copy previous period |
| `06-excel-upload-roundtrip` | Excel data entry (upload) | fill + upload an `.xlsx`, worker import, value reaches reporting |
| `06-paper-form-roundtrip` | paper form data entry | download the paper PDF, re-upload, OpenCV parse; invalid upload fails gracefully |
| `06-project-revision-history` | change tracking | an edit produces a revision entry |
| `06-reporting-drilldown` | general reporting | disaggregate an indicator by site |
| `06-reporting-time-aggregation` | general reporting | months → quarters → years → by-site, invariant total |
| `06-reporting-pivot-config` | pivot tables | choose rows + show-totals layout |
| `06-reporting-graph-toggle` | reporting | toggle a row into the graph view |
| `06-reporting-excel-export` | reporting | download the OLAP report as `.xlsx` |
| `06-data-interpolation` | data interpolation | a monthly value viewed at a finer periodicity shows the `≈` marker |
| `06-project-clone-templates` | project templates | clone structure / structure+data via `clone-project` |
| `06-project-archive-restore` | project archival | archive then restore a project |
| `06-project-list-filters` | basic navigation | list search, ongoing/finished/archived filters, favorites |
| `06-language-switch` | basic navigation | switch the UI language (EN/FR/ES) |
| `06-uploads-page` | data entry (uploads) | the uploads page renders with its empty state |
| `06-error-states` | account / access model | 404 + no-access project navigations land on the error page |
| `06-pdf-logframe-download` | logical framework | download a valid logframe PDF (regression guard for the roboto-fontface bug) |

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
