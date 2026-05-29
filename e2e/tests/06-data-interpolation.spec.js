// Doc use-case: advanced-concepts/data-interpolation
//
// NOTE: the documentation file (advanced-concepts/data-interpolation.md) is a
// stub (title only). The behaviour under test is defined by the in-app help
// ("Why are some data preceded by the symbol ≈?"): when you view data at a FINER
// periodicity than the one it was collected at, monitool's OLAP cube
// (olap-in-memory) redistributes the value across the finer slots — this is
// "interpolation" — and the report marks such cells with a "≈".
//
// The general-reporting group-by selector only offers periodicities coarser-or-
// equal to the collection one, so interpolation cannot be triggered there. The
// OLAP pivot, however, lets you pick ANY time dimension (including finer ones),
// which is where this behaviour is exercised.
//
// Seed one monthly value on the partition-free baseline variable, then in the
// pivot pick "Days" (finer than the monthly collection) as the row dimension and
// assert the "≈" interpolation marker appears.
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

// A report job has finished server-side when the GET .../report/{b64} responds.
const reportResponse = page =>
    page.waitForResponse(r => /\/project\/[^/]+\/report\//.test(r.url()) && r.ok());

test.beforeEach(async () => {
    await resetBaselineInputs();
    // A single monthly value collected at the data source's (monthly) periodicity.
    await seedBaselineInput('2020-01', SITE_A, 30);
});

test('viewing a monthly value at a finer periodicity interpolates it (≈) in the pivot', async ({
    page,
}) => {
    await page.goto(`/app.html#!/projects/${PID}/olap`);

    const table = page.getByTestId('olap-table');
    await expect(table).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // CONTROL — the default single-cell aggregate is the raw monthly total, with
    // NO interpolation marker (viewing at/above the collection periodicity).
    await expect(table).toContainText('30');
    await expect(table).not.toContainText('≈');

    // Pick "Days" as the row dimension — finer than the monthly collection — so the
    // cube redistributes (interpolates) the value across days and marks cells "≈".
    const rowsSelect = page.getByTestId('olap-rows-select');
    await rowsSelect.locator('input.ui-select-search').click();
    await Promise.all([
        reportResponse(page),
        rowsSelect.locator('.ui-select-choices-row', { hasText: 'Days' }).first().click(),
    ]);

    await expect(table).toContainText('≈');
});
