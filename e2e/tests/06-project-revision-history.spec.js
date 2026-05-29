// Doc use-case: data-entry/change-tracking + advanced-concepts/modifying-the-structure-of-forms-after-data-has-already-been-entered
//
// Editing a project (PUT /project/{id}) records a revision, which the
// project.config.history page lists via the revision-summary component. We make
// one controlled edit (rename the project country) on the Basics tab, save it,
// then open the History tab and assert a revision entry appears with the correct
// author and a human-readable change summary.
//
// The `revision` collection is NOT cleared by the suite reset, so we clear the
// baseline project's revisions ourselves in beforeEach for determinism.
import { test, expect } from '../fixtures.js';
import { resetBaselineRevisions } from '../helpers/db.mjs';
import { waitProjectSaved } from '../helpers/responses.mjs';
import { BASELINE_PROJECT_ID, TEST_EMAIL } from '../scripts/constants.mjs';
import { BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const NEW_COUNTRY = 'Revisionland';

test.beforeEach(async () => {
    // The global reset does not drop the `revision` collection; clear the
    // baseline project's history so it starts empty and deterministic.
    await resetBaselineRevisions();
});

test('editing a project records a revision in its history', async ({ page }) => {
    // Open the Basics tab of the baseline project's configuration.
    await page.goto(`/app.html#!/projects/${PID}/basics`);
    const country = page.getByTestId('basics-country');
    await expect(country).toBeVisible();
    await expect(country).toHaveValue(BASELINE.country); // 'E2E Land'

    // Change the country and save. The PUT is what writes the revision row.
    await country.fill(NEW_COUNTRY);
    await Promise.all([waitProjectSaved(page), page.getByTestId('save-button').click()]);

    // Go to the History tab.
    await page.getByTestId('nav-config-history').click();

    const table = page.getByTestId('history-table');
    await expect(table).toBeVisible();

    // Exactly one revision should exist (we cleared history and made one edit).
    await expect(page.getByTestId('history-empty')).toHaveCount(0);
    const rows = table.locator('[data-history-row]');
    await expect(rows).toHaveCount(1);

    // Author is the fixed E2E user.
    await expect(page.getByTestId('history-row-author')).toHaveText(TEST_EMAIL);

    // The change summary describes the country rename (revision-summary).
    const summary = page.getByTestId('history-summary');
    await expect(summary).toContainText(BASELINE.country); // before: 'E2E Land'
    await expect(summary).toContainText(NEW_COUNTRY); // after: 'Revisionland'

    // The single revision is the current state, so its "revert" affordance is
    // present in the DOM but hidden (ng-show="!isEquivalent && revIndex != selected");
    // a revert button only shows for older, non-current revisions.
    await expect(page.getByTestId('history-restore')).toBeAttached();
});
