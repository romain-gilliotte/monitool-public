// Doc use-case: data-entry/paper-form-data-entry
//
// Two tests around the paper-form workflow on the uploads page.
//
// TEST A (round-trip): download the paper-form PDF the app generates for the
// baseline data source, re-upload it on the uploads page, and wait for the worker
// (gm rasterisation -> OpenCV QR/ArUco homography) to recognise it and produce a
// "pending_dataentry" card. The roboto-fontface font bug that used to break PDF
// generation is fixed on this branch, so the PDF is produced and the round-trip
// runs for real.
//
// TEST B (invalid upload): upload a non-form image (a tiny PNG with an allowed
// mime type but no QR / no matching template) and assert the worker fails the
// upload gracefully (status "failed", delete control offered, no SPA crash).
//
// Needs GraphicsMagick (gm) and the workers' OpenCV binding on the host.
// Reporting/downloads/uploads run through Bull workers; we wait on the HTTP
// download event and on the DOM, never on a fixed timeout.
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '../fixtures.js';
import { resetUploads } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { DATASOURCE_ID } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

// Worker parsing (rasterise + OpenCV) is slow; give it room without a fixed wait.
const PARSE_TIMEOUT = 60_000;

// A real, decodable 256x256 PNG that is NOT a paper form (committed fixture). A
// degenerate 1x1 image aborts OpenCV's decoder; this one decodes fine but has no
// QR, so the worker must fail it gracefully.
const NOT_A_FORM_PNG = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'not-a-form.png');

test.beforeEach(async () => {
    await resetUploads();
});

test('paper form round-trip: download the PDF, re-upload it, and see it parsed', async ({
    page,
}) => {
    test.setTimeout(120_000);

    // 1. Download the paper-form PDF for the baseline data source.
    await page.goto(`/app.html#!/projects/${PID}/downloads`);
    const paper = page.getByTestId('downloads-section-paper');
    await expect(paper).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30_000 }),
        paper.getByTestId(`download-link-${DATASOURCE_ID}`).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    const dir = await mkdtemp(join(tmpdir(), 'monitool-paper-'));
    const pdfPath = join(dir, 'paper-form.pdf');
    await writeFile(pdfPath, await readFile(await download.path()));

    // It must be a real PDF: "%PDF" magic bytes.
    const head = await readFile(pdfPath);
    expect(head.subarray(0, 4)).toEqual(Buffer.from([0x25, 0x50, 0x44, 0x46]));

    // 2. Re-upload it on the uploads page.
    await page.goto(`/app.html#!/projects/${PID}/input-uploads`);
    await expect(page.getByTestId('uploads-dropzone')).toBeVisible();
    await page.getByTestId('uploads-file-input').setInputFiles(pdfPath);

    // 3. Wait for the worker to recognise the form: the PDF is rasterised, its QR
    //    + ArUco markers are detected, the page is de-warped via homography, and a
    //    child upload reaches the "pending_dataentry" status. The status marker is
    //    a zero-box ng-switch container, so we assert it is attached (present in
    //    the DOM), not visually rendered.
    await expect(
        page.locator('[data-testid="upload-status"][data-status="pending_dataentry"]').first()
    ).toBeAttached({ timeout: PARSE_TIMEOUT });

    // The SPA stayed healthy throughout.
    await expect(page.getByTestId('app-error')).toHaveCount(0);
});

test('uploading a non-form file fails gracefully', async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(`/app.html#!/projects/${PID}/input-uploads`);
    await expect(page.getByTestId('uploads-dropzone')).toBeVisible();
    await page.getByTestId('uploads-file-input').setInputFiles(NOT_A_FORM_PNG);

    // The worker can't find a QR / matching template -> status "failed".
    const failed = page
        .locator('[data-testid="upload-status"][data-status="failed"]')
        .first();
    await expect(failed).toBeVisible({ timeout: PARSE_TIMEOUT });

    // Graceful error UI: a delete control is offered, and the SPA did not crash.
    await expect(failed.getByTestId('upload-delete-button')).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);
});
