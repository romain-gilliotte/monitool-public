// Doc use-case: reporting/using-pivot-tables
//
// Seed a single known value and verify it shows up in the pivot table (OLAP).
// Distinct from spec 01: that one covers the general reporting table; this one
// covers the pivot/OLAP view.
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    await resetBaselineInputs();
    await seedBaselineInput('2020-01', SITE_A, 7);
});

test('the pivot table reflects entered data', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/olap`);

    const table = page.getByTestId('olap-table');
    await expect(table).toBeVisible();
    // Single seeded value => the total cell shows it.
    await expect(table).toContainText('7');
});
