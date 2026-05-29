// Doc use-case: advanced-concepts/project-archival
//
// Archive a project from the projects list, confirm it leaves the active view
// and appears under the archived filter, then restore it and confirm it returns
// to the active list. Exercises the archive/restore round-trip:
// UI dropdown -> PUT /project (active flag) -> refetch GET /project -> list re-render.
import { test, expect } from '../fixtures.js';
import { resetBaselineActive } from '../helpers/db.mjs';
import { waitProjectSaved } from '../helpers/responses.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    // The spec mutates project.active through the real API; force the baseline
    // back to active so the run is idempotent regardless of prior state.
    await resetBaselineActive();
});

test('archive a project then restore it', async ({ page }) => {
    await page.goto('/app.html#!/projects');

    // The baseline project is active (shown under the finished filter, on by
    // default): its open button is present and there is no error state.
    await expect(page.getByTestId(`project-open-${PID}`)).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // Archive: open the per-card actions dropdown, then click "Archive".
    await page.getByTestId(`project-actions-toggle-${PID}`).click();
    await Promise.all([waitProjectSaved(page, PID), page.getByTestId(`project-archive-${PID}`).click()]);

    // Archived projects are hidden by default => the card leaves the active view.
    await expect(page.getByTestId(`project-open-${PID}`)).toHaveCount(0);

    // Turn on the archived filter: the card reappears in the archived group.
    await page.getByTestId('project-filter-archived').click();
    await expect(page.getByTestId(`project-archived-marker-${PID}`)).toBeVisible();
    await expect(page.getByTestId(`project-restore-${PID}`)).toBeVisible();

    // Restore: the project becomes active again and returns to the active list.
    await Promise.all([waitProjectSaved(page, PID), page.getByTestId(`project-restore-${PID}`).click()]);

    await expect(page.getByTestId(`project-open-${PID}`)).toBeVisible();
    await expect(page.getByTestId(`project-actions-toggle-${PID}`)).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);
});
