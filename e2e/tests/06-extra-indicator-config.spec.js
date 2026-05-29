// Doc use-case: initial-project-configuration/logical-framework/indicators
//
// Add a cross-cutting / "extra" indicator from the Extra indicators page
// (state project.config.extra), save it, then reload the whole app and verify
// it persisted (round-trip through API + Mongo). The indicator is left
// non-computable, matching the documented recommended-order flow where
// indicators "always start their life as non computable".
import { test, expect } from '../fixtures.js';
import { resetBaselineExtraIndicators } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';

const PID = BASELINE_PROJECT_ID.toString();
// Space-free so it survives interpolation into the data-testid attribute.
const DISPLAY = 'E2E-cross-cutting-indicator';

test.beforeEach(async () => {
    await resetBaselineExtraIndicators();
});

test.afterEach(async () => {
    await resetBaselineExtraIndicators();
});

test('add a cross-cutting (extra) indicator and persist it', async ({ page }) => {
    // Open the extra-indicators page; baseline seeds extraIndicators: [] => empty state.
    await page.goto(`/app.html#!/projects/${PID}/extra`);
    await expect(page.getByTestId('extra-indicator-empty')).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // Open the indicator edition modal from the empty-state "Add indicator" link.
    await page.getByTestId('extra-indicator-add-empty').click();
    const display = page.getByTestId('indicator-modal-display');
    await expect(display).toBeVisible();

    // Name it; leave computation on its default ("unavailable" / non-computable).
    // Filling the display makes the planning differ from master, enabling Apply.
    await display.fill(DISPLAY);
    const apply = page.getByTestId('indicator-modal-apply');
    await expect(apply).toBeEnabled();
    await apply.click();

    // The new indicator is now listed (keyed by its display) and the empty state is gone.
    const row = page.getByTestId(`extra-indicator-row-${DISPLAY}`);
    await expect(row).toBeVisible();
    await expect(page.getByTestId('extra-indicator-empty')).toHaveCount(0);

    // Save the project config and wait for the persisting PUT to resolve.
    await Promise.all([
        page.waitForResponse(
            r =>
                r.request().method() === 'PUT' &&
                /\/project\/[^/]+(\?|$)/.test(r.url()) &&
                r.ok()
        ),
        page.getByTestId('save-button').click(),
    ]);

    // Reload the whole app and confirm the extra indicator survived (persisted).
    await page.goto(`/app.html#!/projects/${PID}/extra`);
    await expect(page.getByTestId(`extra-indicator-row-${DISPLAY}`)).toBeVisible();
    await expect(page.getByTestId('extra-indicator-empty')).toHaveCount(0);
});
