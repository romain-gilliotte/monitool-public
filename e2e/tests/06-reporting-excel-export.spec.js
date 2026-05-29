// Doc use-case: reporting/using-general-reporting (the "Download Excel" export
// button on the OLAP / pivot reporting screen)
//
// Open the OLAP pivot for the baseline project and download its report as Excel.
// Distinct from spec 02 (the data-source data-entry FORM download via the
// generate-form worker): this exercises the OLAP export, which fetches
// GET /project/:id/report/:b64Query with renderer "xlsx" and is produced by the
// compute-report Bull worker (exceljs). The worker blocks server-side
// (await job.finished()); we wait on the download event, never on a timeout.
// No GraphicsMagick (gm) is needed here — that is only used by the .xlsx.png
// thumbnail variant, which this plain .xlsx download does not request.
import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures.js';
import { resetBaselineInputs, seedBaselineInput } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test.beforeEach(async () => {
    await resetBaselineInputs();
    // Give the OLAP cube a value so the grid renders; that render is gated by
    // the same condition under which olap-reporting.js computes the download URL.
    await seedBaselineInput('2020-01', SITE_A, 7);
});

test('download the OLAP pivot report as an Excel file', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/olap`);

    // Waiting for the grid guarantees the (json) report round-trip finished and
    // that $ctrl.downloadUrl is now bound on the export anchor's href.
    await expect(page.getByTestId('olap-table')).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30_000 }),
        page.getByTestId('olap-export-excel').click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);

    // An .xlsx is a ZIP archive: it must start with the "PK\x03\x04" magic bytes.
    const path = await download.path();
    const head = await readFile(path);
    expect(head.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
});

