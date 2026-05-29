// Doc use-case: data-entry/online-data-entry + initial-project-configuration/data-source/variables ("Disaggregations" / "Data entry layout")
//
// Enter DISAGGREGATED data through the online form: a variable with two
// partitions (Sex {Male,Female} x Age {<5,>=5}, distribution=1) renders a 3x3
// Handsontable. We fill the 4 editable cells, save, and verify the SUM across
// all partition elements surfaces in the general reporting table.
//
// Distinct from spec 01 (partition-free 1x1 grid): this one exercises the NxM
// grid layout governed by `distribution`, and that reporting aggregates the
// partitions by sum.
//
// Handsontable is a 3rd-party library: its cells are NOT data-testid-addressable.
// The grid wrapper carries data-testid="hot-container" (unique here because the
// dedicated data source has a single variable). Inside, with no row/col headers
// configured, the 9 cells render in row-major DOM order in `.ht_master .htCore
// tbody td`:
//   idx 0=corner   idx 1='<5'    idx 2='>=5'
//   idx 3='Male'   idx 4=M&<5    idx 5=M&>=5
//   idx 6='Female' idx 7=F&<5    idx 8=F&>=5
// => editable data cells are nth(4),(5),(7),(8). We drive them via dblclick +
// fill('.handsontableInput') + Enter, exactly like spec 01.
import { test, expect } from '../fixtures.js';
import { resetPartitionedInputs, purgeReportingCache } from '../helpers/db.mjs';
import { waitInputSaved } from '../helpers/responses.mjs';
import { gridCells, reportingRow } from '../helpers/ui.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { DATASOURCE_PARTITIONED_ID, SITE_A, BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const PERIOD = '2020-01';

test.beforeEach(async () => {
    await resetPartitionedInputs();
});

test('disaggregated data entry surfaces summed across partitions in reporting', async ({ page }) => {
    // Open the data-entry calendar for the disaggregated data source.
    await page.goto(`/app.html#!/projects/${PID}/input/${DATASOURCE_PARTITIONED_ID}/list`);
    await expect(page.getByTestId('input-list-table')).toBeVisible();

    // Open the January 2020 / Site A entry (status "expected").
    const cell = page.getByTestId(`input-cell-${PERIOD}-${SITE_A}`);
    await expect(cell).toHaveAttribute('data-status', 'expected');
    await cell.click();

    // Exactly one grid on this page (single-variable data source).
    const grid = page.getByTestId('hot-container');
    await expect(grid).toHaveCount(1);
    const cells = gridCells(page);
    await expect(cells).toHaveCount(9); // 3x3

    // Sanity-check the layout (header cells) so a future Handsontable layout
    // regression that shifts the editable-cell indices fails loudly.
    await expect(cells.nth(1)).toHaveText('<5');
    await expect(cells.nth(2)).toHaveText('>=5');
    await expect(cells.nth(3)).toHaveText('Male');
    await expect(cells.nth(6)).toHaveText('Female');

    // Fill the 4 editable cells: M&<5=1, M&>=5=2, F&<5=3, F&>=5=4 (sum=10).
    const editable = [
        { idx: 4, value: '1' },
        { idx: 5, value: '2' },
        { idx: 7, value: '3' },
        { idx: 8, value: '4' },
    ];
    for (const { idx, value } of editable) {
        await cells.nth(idx).dblclick();
        await page.locator('.handsontableInput').fill(value);
        await page.keyboard.press('Enter');
        await expect(cells.nth(idx)).toHaveText(value);
    }

    // Save and wait for the input to be persisted (POST .../input).
    await Promise.all([waitInputSaved(page), page.getByTestId('save-button').click()]);

    // Reporting cache is keyed per project and cleared on input writes, but we
    // purge defensively before asserting the recomputed report.
    await purgeReportingCache();

    // Go to general reporting and verify the partition SUM appears.
    await page.getByTestId('nav-usage-reporting-general').click();
    const row = reportingRow(page, BASELINE.partitionedIndicatorName);
    await expect(row.getByTestId(`reporting-cell-${PERIOD}`)).toHaveText('10');
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('10');
});
