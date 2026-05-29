// Doc use-case: reporting/using-general-reporting
//
// Change the time aggregation of the general reporting table and verify the
// column headers re-bucket while the row total stays invariant. Seeds three
// monthly Site-A values that all fall inside 2020-Q1 / year 2020, then walks
// the group-by selector: months -> quarters -> years -> by-site. At each step
// the per-period cells re-aggregate but the indicator row total stays 30.
//
// Distinct from spec 01 (which proves a single entered value surfaces) and
// spec 04 (the OLAP pivot): this one exercises the general-reporting
// time-aggregation selector (query-aggregate) and the resulting column layout.
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A, SITE_B, BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    await resetBaselineInputs();
    // Three Site-A months, all inside 2020-Q1 / year 2020. Total = 30.
    await seedBaselineInput('2020-01', SITE_A, 5);
    await seedBaselineInput('2020-02', SITE_A, 10);
    await seedBaselineInput('2020-03', SITE_A, 15);
});

test('changing the time aggregation re-buckets columns while the total stays consistent', async ({
    page,
}) => {
    await page.goto(`/app.html#!/projects/${PID}/general`);

    // The reporting table is up and the first logframe section auto-opens, so
    // the goal indicator row "Total consultations" is present.
    await expect(page.getByTestId('reporting-table')).toBeVisible();
    const row = page
        .getByTestId('reporting-table')
        .locator('tr', { hasText: BASELINE.indicatorName });

    const groupBy = page.getByTestId('reporting-group-by');
    await expect(groupBy).toBeVisible();

    // --- Default grouping: months (baseline spans 6 months < 15) ---
    await expect(page.getByTestId('reporting-column-header-2020-01')).toHaveText('January 2020');
    await expect(page.getByTestId('reporting-column-header-2020-03')).toHaveText('March 2020');
    await expect(row.getByTestId('reporting-cell-2020-01')).toHaveText('5');
    await expect(row.getByTestId('reporting-cell-2020-02')).toHaveText('10');
    await expect(row.getByTestId('reporting-cell-2020-03')).toHaveText('15');
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('30');

    // --- Switch to quarters ---
    await groupBy.selectOption('quarter');
    await expect(page.getByTestId('reporting-column-header-2020-Q1')).toHaveText('2020-Q1');
    // Month columns are gone.
    await expect(page.getByTestId('reporting-column-header-2020-01')).toHaveCount(0);
    await expect(row.getByTestId('reporting-cell-2020-Q1')).toHaveText('30');
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('30');

    // --- Switch to years ---
    await groupBy.selectOption('year');
    await expect(page.getByTestId('reporting-column-header-2020')).toHaveText('2020');
    await expect(page.getByTestId('reporting-column-header-2020-Q1')).toHaveCount(0);
    await expect(row.getByTestId('reporting-cell-2020')).toHaveText('30');
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('30');

    // --- Switch to by-site (no time) ---
    await groupBy.selectOption('entity');
    await expect(page.getByTestId(`reporting-column-header-${SITE_A}`)).toHaveText(
        BASELINE.siteAName
    );
    await expect(page.getByTestId(`reporting-column-header-${SITE_B}`)).toHaveText(
        BASELINE.siteBName
    );
    // No time columns remain.
    await expect(page.getByTestId('reporting-column-header-2020')).toHaveCount(0);
    // All data was entered for Site A; the total is unchanged.
    await expect(row.getByTestId(`reporting-cell-${SITE_A}`)).toHaveText('30');
    await expect(row.getByTestId('reporting-cell-total')).toHaveText('30');
});

