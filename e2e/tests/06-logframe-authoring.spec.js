// Doc use-case: initial-project-configuration/logical-framework (README anatomy +
// indicators.md "How to create an indicator" + custom-indicator-formulas.md)
//
// Author a logical framework from scratch on the baseline project: create a blank
// logframe, set its name + general objective (goal), add a purpose -> output ->
// activity tree, then add a goal-level indicator computed by COPYING the baseline
// data-source variable (predefined "copy" formula). Save (PUT /project) and reload
// to prove the structure + indicator round-trip through API + Mongo.
//
// The baseline project already ships with one logframe; this spec creates a NEW one
// (fresh client-side uuid) keyed by a unique name, so it never collides with it.
//
// NOTE: the description textareas use an `auto-resize` directive. Filling one
// reflows the layout and shifts the "add" buttons that sit just below it, racing
// a click that immediately follows. We therefore build the whole tree FIRST
// (consecutive add clicks, no intervening fills) and fill the descriptions after.
import { test, expect } from '../fixtures.js';
import { waitProjectSaved } from '../helpers/responses.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const LF_NAME = 'E2E authored logframe';
const LF_GOAL = 'Reduce waiting time in clinics';
const PURPOSE_DESC = 'Improve patient throughput';
const OUTPUT_DESC = 'Triage process redesigned';
const ACTIVITY_DESC = 'Train triage nurses';
const INDICATOR_NAME = 'Authored copy indicator';

test('author a logframe with a goal, a purpose/output/activity tree and a copy-formula indicator', async ({
    page,
}) => {
    // --- Open the logframe list of the baseline project. ---
    await page.goto(`/app.html#!/projects/${PID}/logical-frame`);
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // --- Create a blank logframe (lands on the edition tree with a fresh uuid). ---
    await page.getByTestId('logframe-create-blank-button').click();
    await expect(page).toHaveURL(/\/logical-frame\/[0-9a-f-]{36}/);
    await expect(page.getByTestId('logframe-name-input')).toBeVisible();

    // --- Build the purpose -> output -> activity tree FIRST (no fills in between,
    // so auto-resize reflow never races the next add click). ---
    await page.getByTestId('logframe-add-purpose-button').click();
    await page.getByTestId('logframe-add-output-button-0').click();
    await page.getByTestId('logframe-add-activity-button-0-0').click();

    // --- Now fill every description (and the logframe name + goal). ---
    await page.getByTestId('logframe-name-input').fill(LF_NAME);
    await page.getByTestId('logframe-goal-input').fill(LF_GOAL);
    await page.getByTestId('purpose-desc-0-input').fill(PURPOSE_DESC);
    await page.getByTestId('output-desc-0-0-input').fill(OUTPUT_DESC);
    await page.getByTestId('activity-desc-0-0-0-input').fill(ACTIVITY_DESC);

    // --- Add a goal-level indicator computed by copying the baseline variable. ---
    await page.getByTestId('logframe-add-indicator-button-goal').click();

    const modal = page.getByTestId('indicator-edition-modal');
    await expect(modal).toBeVisible();

    const apply = page.getByTestId('indicator-modal-apply');
    // Nothing entered yet => Apply is disabled.
    await expect(apply).toBeDisabled();

    await page.getByTestId('indicator-modal-display').fill(INDICATOR_NAME);

    // Predefined "copy" formula: auto-fills the formula and shows one parameter row.
    await page.getByTestId('indicator-computation-type-select').selectOption('copy');
    await expect(page.getByTestId('indicator-computation-formula-input')).toHaveValue(
        'copied_value'
    );

    // The variable <select> renders angular-hashed option values, so pick by label.
    await page
        .getByTestId('indicator-computation-variable-select-copied_value')
        .selectOption({ label: BASELINE.variableName });

    // Now the indicator is valid -> Apply enabled; clicking it closes the modal.
    await expect(apply).toBeEnabled();
    await apply.click();
    await expect(modal).toHaveCount(0);

    // The new indicator card shows up in the goal section, marked as computed.
    const card = page.getByTestId('indicator-card').filter({ hasText: INDICATOR_NAME });
    await expect(card).toBeVisible();
    await expect(card.getByTestId('indicator-computation-status')).toBeVisible();

    // --- Save and wait for the project to be persisted (PUT .../project/{id}). ---
    await Promise.all([waitProjectSaved(page, PID), page.getByTestId('save-button').click()]);

    // --- Full app reload, reopen the authored logframe, assert everything persisted. ---
    await page.goto(`/app.html#!/projects/${PID}/logical-frame`);
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // Find the authored logframe card by its (unique) name and open its editor.
    const lfCard = page
        .locator('[data-testid^="logframe-card-name-"]', { hasText: LF_NAME })
        .first();
    await expect(lfCard).toBeVisible();
    const lfId = (await lfCard.getAttribute('data-testid')).replace('logframe-card-name-', '');
    await page.getByTestId(`logframe-edit-link-${lfId}`).click();

    await expect(page.getByTestId('logframe-name-input')).toHaveValue(LF_NAME);
    await expect(page.getByTestId('logframe-goal-input')).toHaveValue(LF_GOAL);
    await expect(page.getByTestId('purpose-desc-0-input')).toHaveValue(PURPOSE_DESC);
    await expect(page.getByTestId('output-desc-0-0-input')).toHaveValue(OUTPUT_DESC);
    await expect(page.getByTestId('activity-desc-0-0-0-input')).toHaveValue(ACTIVITY_DESC);

    const reloadedCard = page
        .getByTestId('indicator-card')
        .filter({ hasText: INDICATOR_NAME });
    await expect(reloadedCard).toBeVisible();
    await expect(reloadedCard.getByTestId('indicator-computation-status')).toBeVisible();
});
