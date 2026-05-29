// Doc use-case: data-entry/excel-data-entry (the form-generation side)
//
// From the downloads page, download the Excel data-entry form of a data source
// and check we get a real .xlsx file. Exercises the async worker chain
// (generate-form -> exceljs -> thumbnail). Requires GraphicsMagick (`gm`)
// installed on the host for the worker's thumbnail step — see e2e/README.md.
import { readFile } from 'node:fs/promises';
import { test, expect } from '../fixtures.js';
import { BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { DATASOURCE_ID } from '../scripts/seed-baseline.mjs';

const PID = BASELINE_PROJECT_ID.toString();

test('download the Excel data-entry form for a data source', async ({ page }) => {
    await page.goto(`/app.html#!/projects/${PID}/downloads`);
    await expect(page.getByTestId('downloads-section-excel')).toBeVisible();

    const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 30_000 }),
        page.getByTestId(`download-link-${DATASOURCE_ID}xls`).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);

    // An .xlsx is a ZIP archive: it must start with the "PK\x03\x04" magic bytes.
    const path = await download.path();
    const head = await readFile(path);
    expect(head.subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
});
