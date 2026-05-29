// Doc use-case: getting-started/basic-navigation (project selection screen:
// text search, ongoing/finished/archived filters, favorites star)
//
// On the projects list, exercise the three navigation controls documented in
// basic-navigation: the text search, the ongoing/finished/archived filter
// toggles, and the per-project favorite star. Anchored on the two seeded
// projects, which deterministically sit in two different buckets:
//   - demo (Gondwana): active + end offset to ~now  => "ongoing"
//   - baseline (E2E Land): active + end 2020-06-30  => "finished"
// No db writes: favorites live in browser localStorage, so we reset them via
// addInitScript before the AngularJS app boots (same trick as fixtures.js).
import { test, expect } from '../fixtures.js';
import { getDemoProjectId } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async ({ page }) => {
    // Favorites persist in localStorage; strip any leaked keys before boot so
    // every run starts from an un-starred state.
    await page.addInitScript(() => {
        try {
            for (const key of Object.keys(window.localStorage)) {
                if (key.startsWith('favorites::projects::')) window.localStorage.removeItem(key);
            }
        } catch {
            // ignore (storage may be unavailable before navigation)
        }
    });
});

test('projects list: search, filter toggles and favorites', async ({ page }) => {
    const demoId = await getDemoProjectId();

    const demoCard = page.getByTestId(`project-card-${demoId}`);
    const baselineCard = page.getByTestId(`project-card-${PID}`);
    const cards = page.locator('[data-testid^="project-card-"]');

    await page.goto('/app.html#!/projects');
    await expect(page.getByTestId('project-list')).toBeVisible();

    // Both seeded projects are visible by default (ongoing + finished shown).
    await expect(demoCard).toBeVisible();
    await expect(baselineCard).toBeVisible();

    // --- Text search ---------------------------------------------------------
    // Searching the baseline's country keeps the baseline and drops the demo.
    await page.getByTestId('project-filter-input').fill(BASELINE.country);
    await expect(baselineCard).toBeVisible();
    await expect(demoCard).toHaveCount(0);

    // A needle that matches nothing surfaces the empty/no-matches message.
    await page.getByTestId('project-filter-input').fill('zzz-no-such-project');
    await expect(page.getByTestId('project-list-empty')).toBeVisible();
    await expect(cards).toHaveCount(0);

    // Clearing the search restores both cards.
    await page.getByTestId('project-filter-input').fill('');
    await expect(demoCard).toBeVisible();
    await expect(baselineCard).toBeVisible();

    // --- Filter toggles ------------------------------------------------------
    // Hiding "finished" drops the baseline (finished) but keeps the demo (ongoing).
    const finishedTab = page.getByTestId('project-filter-finished');
    await finishedTab.click();
    await expect(finishedTab).toHaveAttribute('data-active', 'false');
    await expect(baselineCard).toHaveCount(0);
    await expect(demoCard).toBeVisible();

    // Re-enabling "finished" brings the baseline back.
    await finishedTab.click();
    await expect(finishedTab).toHaveAttribute('data-active', 'true');
    await expect(baselineCard).toBeVisible();

    // --- Favorites -----------------------------------------------------------
    // Starring the demo flips its favorite flag and floats it to the top.
    const demoFavorite = page.getByTestId(`project-favorite-${demoId}`);
    await expect(demoFavorite).toHaveAttribute('data-favorite', 'false');
    await demoFavorite.click();
    await expect(demoFavorite).toHaveAttribute('data-favorite', 'true');
    await expect(cards.first()).toHaveAttribute('data-testid', `project-card-${demoId}`);

    // Un-starring resets the flag.
    await demoFavorite.click();
    await expect(demoFavorite).toHaveAttribute('data-favorite', 'false');
});
