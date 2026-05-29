// Doc use-case: reporting/using-pivot-tables
//
// Configure the OLAP pivot layout: pick a row dimension, then toggle
// show-totals, and assert the pivot re-renders with the chosen layout.
// Builds on spec 04 (which only checks a seeded value surfaces in the pivot):
// here we drive the rows/cols/totals controls of <olap-dimensions> and verify
// the grid (<olap-grid> / olap-table) re-shapes accordingly.
//
// Note on selectors: the rows/cols pickers are AngularUI `ui-select` (multiple)
// widgets. Their searchable option list and selected "pills" are rendered by
// the library with no stable per-option attribute, so — exactly like the
// Handsontable grid in spec 01 — they cannot carry data-testids. We anchor the
// widget with a data-testid on the <ui-select> element and drive the dropdown
// through the library's own classes scoped under that anchor. The show-totals
// control is a plain checkbox and is data-testid'd directly.
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

// The baseline report request is a GET .../report/<b64query> rendered as JSON;
// we wait on it so assertions run against a freshly re-rendered pivot.
const reportResponse = page =>
    page.waitForResponse(r => /\/project\/[^/]+\/report\//.test(r.url()) && r.ok());

test.beforeEach(async () => {
    await resetBaselineInputs();
    await seedBaselineInput('2020-01', SITE_A, 7);
});

test('the pivot re-renders for the chosen rows and totals layout', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/olap`);

    const table = page.getByTestId('olap-table');
    await expect(table).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // Initial layout: no rows, no columns => a single total cell with the value.
    const bodyRows = table.locator('tbody tr');
    await expect(bodyRows).toHaveCount(1);
    await expect(table).toContainText('7');

    // --- Pick "Months" as the row dimension (library-driven ui-select multiple).
    // Focusing the always-visible search input opens the choices list; we click
    // the "Months" choice (scoped to this widget) rather than typing. ---
    const rowsSelect = page.getByTestId('olap-rows-select');
    await rowsSelect.locator('input.ui-select-search').click(); // open the dropdown
    await Promise.all([
        reportResponse(page),
        rowsSelect.locator('.ui-select-choices-row', { hasText: 'Months' }).first().click(),
    ]);

    // The pivot now has one row per month over 2020-01..2020-06 (6 rows).
    await expect(bodyRows).toHaveCount(6);
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // The seeded value lands in the January 2020 row (olap-in-memory humanizes
    // the month value in English).
    const janRow = bodyRows.filter({ hasText: 'January 2020' });
    await expect(janRow).toHaveCount(1);
    await expect(janRow).toContainText('7');

    // --- Toggle show-totals: a total row is appended (6 -> 7 rows) ---
    await Promise.all([reportResponse(page), page.getByTestId('olap-show-totals').check()]);

    await expect(bodyRows).toHaveCount(7);
    await expect(page.getByTestId('app-error')).toHaveCount(0);
});

