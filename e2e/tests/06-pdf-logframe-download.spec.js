// Doc use-case: initial-project-configuration/logical-framework (downloading the
// logframe as a PDF from the downloads page).
//
// Download the logical-framework PDF and check we get a real PDF document.
// Exercises the async worker chain (generate-logframe -> pdfmake -> thumbnail),
// which renders text with the Roboto font loaded from
// node_modules/roboto-fontface. This is the regression guard for the font bug:
//
//   Commit 076a9748 removed roboto-fontface as "unused", but both PDF
//   generators (downloads/logframe/pdf.js, downloads/datasource/pdf.js) still
//   reference node_modules/roboto-fontface/fonts/roboto/Roboto-*.woff at
//   runtime. Without it, pdfmake throws ENOENT (Roboto-Medium.woff), the
//   blocking generate-logframe job rejects, and the API returns HTTP 500 with a
//   JSON body instead of a PDF. Commit 48fd8bde restored the dependency.
//
// If anyone drops roboto-fontface again, this test goes red. (To turn it into
// the documented-failing form against the pre-fix state, change `test(` to
// `test.fail(` below.)
import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures.js';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { LOGFRAME_ID } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46]); // "%PDF"

test('download the logical-framework PDF for a project', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/downloads`);
    await expect(page.getByTestId('downloads-section-logframes')).toBeVisible();

    // The logframe portrait download link (file.id === lf.id for this section).
    const link = page.getByTestId(`download-link-${LOGFRAME_ID}`);
    await expect(link).toBeVisible();

    // The href points at the API PDF endpoint (proxied under /api): hitting it
    // runs the blocking generate-logframe worker job and streams the PDF back.
    const href = await link.getAttribute('href');
    expect(href).toContain(`/logical-frame/${LOGFRAME_ID}.pdf`);

    // Fetch the same URL the link triggers and assert it is a real PDF. The
    // worker job blocks server-side (await job.finished()), so no polling.
    const response = await page.request.get(href, { timeout: 30_000 });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');

    const body = await response.body();
    expect(body.subarray(0, 4)).toEqual(PDF_MAGIC);

    // Also drive the actual <a download> link (mirrors the Excel-download spec):
    // a successful response yields a Playwright download event with a .pdf file.
    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30_000 }),
        link.click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

    const path = await download.path();
    const head = await readFile(path);
    expect(head.subarray(0, 4)).toEqual(PDF_MAGIC);
});
