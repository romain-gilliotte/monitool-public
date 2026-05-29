// Doc use-case: data-entry/README (the upload-based entry points — excel-data-entry
// & paper-form-data-entry — share one landing surface: the uploads listing page).
//
// Smoke-test the uploads listing page as its own surface, distinct from the
// excel/paper round-trips: visit /input-uploads for the baseline project and
// assert it renders without error — dropzone + file input present, and the
// "waiting for data entry" empty state shown because no uploads are pending.
//
// The page opens an SSE change-stream (POST .../upload-sse) on init; mongod runs
// with --replSet in the harness, so that wiring does not throw. The render does
// not block on the stream, so these assertions stay deterministic.
import { test, expect } from '../fixtures.js';
import { resetBaselineUploads } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    await resetBaselineUploads();
});

test('the uploads page renders the dropzone and an empty pending list', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/input-uploads`);

    // Route resolved (GET .../upload) and the component booted.
    await expect(page.getByTestId('uploads-page')).toBeVisible();

    // No error state: in particular the SSE/change-stream init did not throw.
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    // The drag/drop surface and its (hidden) file input are wired.
    await expect(page.getByTestId('uploads-dropzone')).toBeVisible();
    await expect(page.getByTestId('uploads-file-input')).toBeAttached();

    // The baseline has no pending uploads => empty-state message, no cards.
    await expect(page.getByTestId('uploads-empty')).toBeVisible();
    await expect(
        page.locator('[data-testid^="uploads-item-"]')
    ).toHaveCount(0);
});
