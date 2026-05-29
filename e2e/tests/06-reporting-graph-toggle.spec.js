// Doc use-case: reporting/using-general-reporting (graph/plot toggle)
//
// On the general reporting screen, toggle a data row into the graph/plot view
// and verify the chart wrapper renders, then toggle it back off. We only assert
// the chart *wrapper* (a data-testid div), never c3's async SVG internals, so the
// test stays meaningful across a frontend migration. A single known value is
// seeded so the row has deterministic, loaded plot data before we click.
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { reportingRow } from '../helpers/ui.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A, BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    await resetBaselineInputs();
    await seedBaselineInput('2020-01', SITE_A, 7);
});

test('toggling a reporting row into the graph view renders the chart wrapper', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/general`);

    // The reporting table loads and auto-opens its first section (the logframe),
    // so the goal indicator row is rendered.
    await expect(page.getByTestId('reporting-table')).toBeVisible();

    const row = reportingRow(page, BASELINE.indicatorName);

    // Wait until the row's value is computed: the same fetch that fills this cell
    // also delivers the plot data, which the toggle needs before it will activate.
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('7');

    // No graph yet (reporting-graph is behind ng-if="plotData.ys.length > 0").
    await expect(page.getByTestId('reporting-graph-wrapper')).toHaveCount(0);

    // Toggle the plot on for this row.
    await row.getByTestId('reporting-plot-toggle').click();

    // The chart wrapper renders. We assert only the wrapper, not the c3 SVG.
    await expect(page.getByTestId('reporting-graph-wrapper')).toBeVisible();

    // Toggle it back off: the wrapper disappears again.
    await row.getByTestId('reporting-plot-toggle').click();
    await expect(page.getByTestId('reporting-graph-wrapper')).toHaveCount(0);
});

