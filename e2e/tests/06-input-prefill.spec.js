// Doc use-case: data-entry/online-data-entry
//
// "You can prefill the form with data from previous periods, or with zero
// values, by clicking on the appropriate button."
//
// Two prefill buttons live in the online data-entry form (project-input-edition):
//   - "Zeros"          -> fillWithZeros()  : sets every data field to 0
//   - "Previous entry" -> fillFromLast()   : copies the previous period's data
// The baseline variable is partition-free, so each input is a 1x1 Handsontable
// grid driven via the cell element (Handsontable renders the cell, so it has no
// data-testid — we target it inside the hot-container by its rendered DOM).
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { waitInputSaved } from '../helpers/responses.mjs';
import { gridCell } from '../helpers/ui.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { DATASOURCE_ID, SITE_A } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    await resetBaselineInputs();
});

test('prefill with zeros fills the grid and saves', async ({ page }) => {
    const PERIOD = '2020-01';

    // Open the January 2020 / Site A entry directly (a settled edit view; opening
    // via the calendar cell races the grid's initial render against the click).
    await page.goto(`/app.html#!/projects/${PID}/input/manual/${DATASOURCE_ID}/${PERIOD}/${SITE_A}`);

    // The prefill toolbar only appears once the input + grid have loaded.
    const zerosBtn = page.getByTestId('input-prefill-zeros');
    await expect(zerosBtn).toBeVisible();
    await expect(gridCell(page)).toBeVisible();

    // Click "Zeros": fillWithZeros() sets the single cell to 0.
    await zerosBtn.click();
    await expect(gridCell(page)).toHaveText('0');

    // Save and wait for persistence (POST .../input).
    await Promise.all([waitInputSaved(page), page.getByTestId('save-button').click()]);

    // Reload the edit form straight from its URL: the saved 0 must reappear.
    await page.goto(`/app.html#!/projects/${PID}/input/manual/${DATASOURCE_ID}/${PERIOD}/${SITE_A}`);
    await expect(page.getByTestId('input-prefill-zeros')).toBeVisible();
    await expect(gridCell(page)).toHaveText('0');
});

test('prefill from the previous period copies its value', async ({ page }) => {
    const PREVIOUS = '2020-01';
    const PERIOD = '2020-02';

    // Seed a value in the previous period so "Previous entry" has data to copy.
    await seedBaselineInput(PREVIOUS, SITE_A, 17);

    // Open the February 2020 / Site A entry directly (settled edit view).
    await page.goto(`/app.html#!/projects/${PID}/input/manual/${DATASOURCE_ID}/${PERIOD}/${SITE_A}`);

    const previousBtn = page.getByTestId('input-prefill-previous');
    await expect(previousBtn).toBeVisible();
    await expect(gridCell(page)).toBeVisible();

    // Click "Previous entry": the cell copies January's value.
    await previousBtn.click();
    await expect(gridCell(page)).toHaveText('17');

    // Save and wait for persistence.
    await Promise.all([waitInputSaved(page), page.getByTestId('save-button').click()]);

    // Reload the February edit form: the copied 17 must persist.
    await page.goto(`/app.html#!/projects/${PID}/input/manual/${DATASOURCE_ID}/${PERIOD}/${SITE_A}`);
    await expect(page.getByTestId('input-prefill-previous')).toBeVisible();
    await expect(gridCell(page)).toHaveText('17');
});

