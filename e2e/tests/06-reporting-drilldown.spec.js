// Doc use-case: reporting/using-general-reporting (drill-down / disaggregation)
//
// The general reporting table lets you drill an indicator row down by a
// dimension. Here we disaggregate the goal indicator by collection site and
// assert the per-site breakdown: the aggregate row sums both sites, and the
// two site sub-rows show each site's own value. Distinct from spec 01 (which
// checks a single value surfaces) and spec 04 (the OLAP pivot view).
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A, SITE_B, BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const PERIOD = '2020-01';
const SITE_A_VALUE = 10;
const SITE_B_VALUE = 5;

test.beforeEach(async () => {
    // Seed both sites for the SAME month so the January aggregate is the sum of
    // the two per-site values (geoAgg=sum). Each seed call purges the reporting
    // cache, so the worker recomputes from the freshly seeded inputs.
    await resetBaselineInputs();
    await seedBaselineInput(PERIOD, SITE_A, SITE_A_VALUE);
    await seedBaselineInput(PERIOD, SITE_B, SITE_B_VALUE);
});

test('disaggregate a general-reporting indicator by site and read per-site values', async ({
    page,
}) => {
    await page.goto(`/app.html#!/projects/${PID}/general`);

    // The logical-framework section auto-opens on first load, revealing the
    // single goal indicator data row.
    const table = page.getByTestId('reporting-table');
    await expect(table).toBeVisible();

    const indicatorRow = table.locator('tr', { hasText: BASELINE.indicatorName });
    await expect(indicatorRow).toBeVisible();

    // The aggregate row sums both sites for January (10 + 5 = 15).
    await expect(indicatorRow.getByTestId(`reporting-cell-${PERIOD}`)).toContainText('15');
    await expect(indicatorRow.getByTestId('reporting-cell-total')).toContainText('15');

    // Open the per-row disaggregation dropdown and split by Sites. The menu is
    // teleported to <body> (uib dropdown-append-to-body), so the option lives at
    // page scope, not inside the row.
    await indicatorRow.getByTestId('reporting-disaggregate-toggle').click();
    // The baseline logframe has two indicators, each with its own disaggregation
    // menu; the uib dropdown teleports the OPEN menu to <body>, so target the
    // visible "Sites" option (the closed one stays hidden in its row).
    await page.getByTestId('reporting-disaggregate-option-location').filter({ visible: true }).click();

    // Two indented sub-rows appear, keyed by site id, each diced to one site.
    const siteARow = table.getByTestId(`reporting-row-site-${SITE_A}`);
    const siteBRow = table.getByTestId(`reporting-row-site-${SITE_B}`);
    await expect(siteARow).toBeVisible();
    await expect(siteBRow).toBeVisible();

    // The per-site breakdown: each site shows its own January value.
    await expect(siteARow.getByTestId(`reporting-cell-${PERIOD}`)).toContainText(
        String(SITE_A_VALUE)
    );
    await expect(siteBRow.getByTestId(`reporting-cell-${PERIOD}`)).toContainText(
        String(SITE_B_VALUE)
    );

    // Collapsing the disaggregation removes the per-site sub-rows.
    await indicatorRow.getByTestId('reporting-disaggregate-collapse').click();
    await expect(table.getByTestId(`reporting-row-site-${SITE_A}`)).toHaveCount(0);
    await expect(table.getByTestId(`reporting-row-site-${SITE_B}`)).toHaveCount(0);
});
