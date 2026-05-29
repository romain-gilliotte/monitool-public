// Doc use-case: advanced-concepts/project-templates (Cloning project template)
//
// From the projects list, use a project as a template via the per-card action
// dropdown: "Clone structure" (structure only) and "Clone structure and data"
// (structure + inputs). Both go through POST /rpc/clone-project, which names the
// new project "Copy of <name>" and, for structure+data, shares the source's
// input sequence so previously entered values carry over.
//
// We clone the deterministic baseline (seeded with one known input) and assert:
//   - a new "Copy of ..." card appears live for each clone,
//   - the structure+data clone surfaces the carried value (42) in reporting,
//   - the structure-only clone does NOT carry that value,
//   - both clones persist across a full app reload.
import { test, expect } from '../fixtures.js';
import { MongoClient, ObjectId } from 'mongodb';
import { resetBaselineInputs, seedBaselineInput, purgeReportingCacheFor } from '../helpers/db.mjs';
import { MONGO_URI, MONGO_DB, BASELINE_PROJECT_ID } from '../scripts/constants.mjs';
import { SITE_A, BASELINE } from '../scripts/seed-baseline.mjs';

const BASELINE_ID = BASELINE_PROJECT_ID.toString();
const PERIOD = '2020-01';
const CLONE_NAME = `Copy of ${BASELINE.name}`;

// The cloned projects get fresh ObjectIds; track them so afterAll can remove
// them (and their input sequences) and keep the baseline state pristine for the
// serial suite.
const createdProjectIds = [];

test.beforeEach(async () => {
    // Start from a clean slate, then seed a single known value so the
    // structure+data clone has a deterministic number to carry over.
    await resetBaselineInputs();
    await seedBaselineInput(PERIOD, SITE_A, 42);
});

test.afterAll(async () => {
    // Remove the clones we created and any input_seq that references only them,
    // and drop the clone ids from the baseline's shared sequence.
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db(MONGO_DB);
        for (const id of createdProjectIds) {
            const oid = new ObjectId(id);
            await db.collection('project').deleteOne({ _id: oid });
            await db.collection('input_seq').deleteMany({ projectIds: [oid] });
            await db.collection('input_seq').updateMany({}, { $pull: { projectIds: oid } });
        }
    } finally {
        await client.close().catch(() => {});
    }
});

test('clone a project as a template (structure only, and structure + data)', async ({ page }) => {
    await page.goto('/app.html#!/projects');
    await expect(page.getByTestId(`project-open-${BASELINE_ID}`)).toBeVisible();

    // --- Clone STRUCTURE ONLY -------------------------------------------------
    // The clone actions live in the card's Bootstrap dropdown; open it first so
    // the menu items are actionable, then trigger the structure-only clone and
    // wait on the RPC response to learn the new project's id.
    await page.getByTestId(`project-actions-toggle-${BASELINE_ID}`).click();
    const [structureResp] = await Promise.all([
        page.waitForResponse(
            r =>
                r.request().method() === 'POST' &&
                r.url().includes('/rpc/clone-project') &&
                r.ok()
        ),
        page.getByTestId(`project-clone-structure-${BASELINE_ID}`).click(),
    ]);
    const structureBody = await structureResp.json();
    expect(structureBody.name).toBe(CLONE_NAME);
    const structureId = structureBody._id.toString();
    createdProjectIds.push(structureId);

    // The new card is pushed into the list in-memory (no reload).
    await expect(page.getByTestId(`project-open-${structureId}`)).toBeVisible();

    // --- Clone STRUCTURE + DATA ----------------------------------------------
    await page.getByTestId(`project-actions-toggle-${BASELINE_ID}`).click();
    const [allResp] = await Promise.all([
        page.waitForResponse(
            r =>
                r.request().method() === 'POST' &&
                r.url().includes('/rpc/clone-project') &&
                r.ok()
        ),
        page.getByTestId(`project-clone-all-${BASELINE_ID}`).click(),
    ]);
    const allBody = await allResp.json();
    expect(allBody.name).toBe(CLONE_NAME);
    const allId = allBody._id.toString();
    createdProjectIds.push(allId);

    await expect(page.getByTestId(`project-open-${allId}`)).toBeVisible();

    // --- The structure+data clone CARRIES the seeded value -------------------
    // Reporting is cached per project in Redis; purge the clone's key so the
    // worker recomputes from the (shared) inputs.
    await purgeReportingCacheFor(allId);
    await page.goto(`/app.html#!/projects/${allId}/general`);
    await expect(page.getByTestId('app-error')).toHaveCount(0);
    const allRow = page
        .getByTestId('reporting-table')
        .locator('tr', { hasText: BASELINE.indicatorName });
    await expect(allRow.getByTestId(`reporting-cell-${PERIOD}`)).toHaveText('42');

    // --- The structure-only clone does NOT carry the value -------------------
    await purgeReportingCacheFor(structureId);
    await page.goto(`/app.html#!/projects/${structureId}/general`);
    await expect(page.getByTestId('app-error')).toHaveCount(0);
    const structureRow = page
        .getByTestId('reporting-table')
        .locator('tr', { hasText: BASELINE.indicatorName });
    await expect(structureRow.getByTestId(`reporting-cell-${PERIOD}`)).not.toHaveText('42');

    // --- Both clones persist across a full app reload ------------------------
    await page.goto('/app.html#!/projects');
    await expect(page.getByTestId(`project-open-${structureId}`)).toBeVisible();
    await expect(page.getByTestId(`project-open-${allId}`)).toBeVisible();
    await expect(page.locator('text=' + CLONE_NAME).first()).toBeVisible();
});
