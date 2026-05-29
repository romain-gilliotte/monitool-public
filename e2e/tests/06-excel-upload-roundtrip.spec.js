// Doc use-case: data-entry/excel-data-entry (the upload side)
//
// The full Excel round-trip, building on spec 02 (which downloads the .xlsx):
// download the data-entry template for the baseline data source, fill the
// consultation value + site/period into the right cells, upload it back, let the
// async worker (process-upload -> xlsx/process.js) parse it into a pending entry,
// transcribe it through the data-entry editor (Load data -> Fill from upload ->
// Save), then check the value surfaces in the general reporting table.
//
// Notes on the chain this exercises:
//  - The downloaded .xlsx carries a per-template random id (base64) in the hidden
//    `Metadata!J1` cell; the API stores a matching `forms` doc keyed by that id
//    with the cell boundaries. The upload worker reads J1, finds the form doc and
//    reads each boundary cell. So we MUST edit the *live* downloaded bytes and
//    leave J1 untouched (a static fixture would not match).
//  - Boundaries (see workers/.../downloads/datasource/xlsx.js): the site name goes
//    in `Data Entry!A2`, the period display name in `D2`, and the partition-free
//    variable value in `A5` (row 4 is the variable's title row).
//  - The pending->editable transition is pushed over an SSE stream; we wait on
//    the DOM / poll Mongo, never on a fixed timeout.
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
import { test, expect } from '../fixtures.js';
import {
    resetBaselineInputs,
    resetBaselineUploads,
    getBaselineUploadId,
    purgeReportingCache,
} from '../helpers/db.mjs';
import { waitInputSaved } from '../helpers/responses.mjs';
import { gridCell, reportingRow } from '../helpers/ui.mjs';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { DATASOURCE_ID, BASELINE } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const PERIOD = '2020-01';
const VALUE = '42';

// As produced by the worker (TimeSlot humanizeValue + first/last date), see
// workers/src/tasks/downloads/datasource/xlsx.js (Metadata column F).
const SITE_NAME = BASELINE.siteAName; // 'Site A'
const PERIOD_DISPLAY = 'January 2020 (2020-01-01 -> 2020-01-31)';

test.beforeEach(async () => {
    await resetBaselineInputs();
    await resetBaselineUploads();
});

test('an uploaded Excel form is transcribed into the general reporting table', async ({
    page,
    request,
}) => {
    // 1. Download the live template bytes through the API (this also lazily
    //    creates the matching `forms` doc the upload worker will look up). In
    //    authDisabled mode the API defaults to the e2e user, who owns the baseline.
    const dlResponse = await request.get(
        `/api/project/${PID}/data-source/${DATASOURCE_ID}.xlsx?language=en`
    );
    expect(dlResponse.ok()).toBeTruthy();
    const templateBytes = Buffer.from(await dlResponse.body());
    // An .xlsx is a ZIP: it must start with the "PK\x03\x04" magic bytes.
    expect(templateBytes.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));

    // 2. Fill the downloaded workbook in place (preserving Metadata!J1).
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(templateBytes);
    const ws = wb.getWorksheet('Data Entry');
    ws.getCell('A2').value = SITE_NAME; // siteName boundary
    ws.getCell('D2').value = PERIOD_DISPLAY; // periodName boundary
    ws.getCell('A5').value = Number(VALUE); // partition-free variable boundary

    const dir = await mkdtemp(join(tmpdir(), 'monitool-e2e-xlsx-'));
    const filePath = join(dir, 'baseline-january.xlsx');
    await writeFile(filePath, Buffer.from(await wb.xlsx.writeBuffer()));

    // 3. Open the uploads page and upload the filled file.
    await page.goto(`/app.html#!/projects/${PID}/input-uploads`);
    const fileInput = page.getByTestId('uploads-file-input');
    await expect(fileInput).toBeAttached();

    await Promise.all([
        page.waitForResponse(
            r =>
                r.request().method() === 'POST' &&
                /\/project\/[^/]+\/upload(\?|$)/.test(r.url()) &&
                r.ok()
        ),
        fileInput.setInputFiles(filePath),
    ]);

    // 4. Wait for the worker to parse the xlsx -> status pending_dataentry. The
    //    upload card's edit link appears via the SSE stream once processed.
    const uploadId = await waitForUploadId();
    const editLink = page.getByTestId(`upload-edit-link-${uploadId}`);
    await expect(editLink).toBeVisible({ timeout: 30_000 });

    // 5. Open the data-entry editor for that upload.
    await page.goto(`/app.html#!/projects/${PID}/input/upload/${uploadId}`);

    // Site + period are pre-resolved from the parsed file; load the input then
    // copy the extracted value into the grid.
    await page.getByTestId('load-data-button').click();
    await expect(page.getByTestId('hot-container')).toBeVisible();
    await page.getByTestId('fill-from-upload-button').click();

    // The extracted value lands in the grid (waiting for hot-container above
    // avoids racing the grid's initial render).
    await expect(gridCell(page)).toHaveText(VALUE);

    // 6. Save: persists the input.
    await Promise.all([waitInputSaved(page), page.getByTestId('save-button').click()]);

    // 7. Purge the per-project reporting cache so the recomputation reflects the
    //    freshly transcribed input.
    await purgeReportingCache();

    await page.goto(`/app.html#!/projects/${PID}/general`);
    const row = reportingRow(page, BASELINE.indicatorName);
    await expect(row.getByTestId(`reporting-cell-${PERIOD}`)).toHaveText(VALUE);
    await expect(row.getByTestId('reporting-cell-total')).toHaveText(VALUE);
});

// The upload _id is not returned by the POST, and the card is keyed by that id.
// Poll Mongo (cheap, deterministic: uploads were purged in beforeEach) until the
// single input_upload row exists, then return its id.
async function waitForUploadId() {
    let uploadId = null;
    await expect
        .poll(async () => {
            try {
                uploadId = await getBaselineUploadId();
            } catch {
                uploadId = null;
            }
            return uploadId;
        }, { timeout: 30_000 })
        .not.toBeNull();
    return uploadId;
}
