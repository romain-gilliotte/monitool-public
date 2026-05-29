// Doc use-case: data-entry/online-data-entry + reporting/using-general-reporting
//
// Enter a value through the online form (Handsontable grid), save it, then check
// it surfaces in the general reporting table. Exercises the full critical path:
// UI -> Mongo -> async worker (compute-report) -> reporting cell.
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs } from '../helpers/db.mjs';
import { waitInputSaved } from '../helpers/responses.mjs';
import { gridCell, reportingRow } from '../helpers/ui.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { DATASOURCE_ID, SITE_A, BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const PERIOD = '2020-01';

test.beforeEach(async () => {
    await resetBaselineInputs();
});

test('online data entry surfaces in the general reporting table', async ({ page }) => {
    // Open the data-entry calendar for the baseline data source.
    await page.goto(`/app.html#!/projects/${PID}/input/${DATASOURCE_ID}/list`);
    await expect(page.getByTestId('input-list-table')).toBeVisible();

    // Open the January 2020 / Site A entry (status "expected").
    const cell = page.getByTestId(`input-cell-${PERIOD}-${SITE_A}`);
    await expect(cell).toHaveAttribute('data-status', 'expected');
    await cell.click();

    // Type 42 in the single editable cell of the (1x1) Handsontable grid.
    await expect(gridCell(page)).toBeVisible();
    await gridCell(page).dblclick();
    await page.locator('.handsontableInput').fill('42');
    await page.keyboard.press('Enter');
    await expect(gridCell(page)).toHaveText('42');

    // Save and wait for the input to be persisted (POST .../input).
    await Promise.all([waitInputSaved(page), page.getByTestId('save-button').click()]);

    // Go to general reporting and verify the value appears in the right column.
    await page.getByTestId('nav-usage-reporting-general').click();
    const row = reportingRow(page, BASELINE.indicatorName);
    await expect(row.getByTestId(`reporting-cell-${PERIOD}`)).toHaveText('42');
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('42');
});
