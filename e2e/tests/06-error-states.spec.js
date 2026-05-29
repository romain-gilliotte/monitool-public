// Doc use-case: getting-started/register-an-account (ownership/access model)
//
// Negative paths of the project ownership model. A user can only reach a project
// they own or have an accepted invitation for; anything else (a non-existent id,
// a malformed id, or a project owned by someone else) must NOT leak data and must
// surface the generic application error page instead.
//
// Mechanics: the abstract `project` state resolves Project.get -> GET /project/:id.
// The API's getProject matches { _id } AND (owner OR accepted invitation); a miss
// throws 'not found' -> 404, and a non-24-hex id throws -> 404 too. The ui-router
// transition then errors and app.js redirects to the `error` state
// (/#!/error/:message), which renders the data-testid="app-error" panel. In
// monitool "no access" is therefore indistinguishable from "not found".
import { test, expect } from '../fixtures.js';
import { seedForeignProject, deleteProject } from '../helpers/db.mjs';

// Well-formed but non-existent 24-hex ObjectId (nothing is ever seeded with it).
const MISSING_PID = '000000000000000000000000';
// Malformed id (not 24 hex) -> API new ObjectId() throws -> 404 branch in router.
const MALFORMED_PID = 'not-a-valid-id';

test.describe('error states (404 / no access)', () => {
    test('a non-existent project id lands on the application error page', async ({ page }) => {
        await page.goto(`/app.html#!/projects/${MISSING_PID}/input-home`);

        await expect(page.getByTestId('app-error')).toBeVisible();
        await expect(page).toHaveURL(/#!\/error\//);
    });

    test('a malformed project id lands on the application error page', async ({ page }) => {
        await page.goto(`/app.html#!/projects/${MALFORMED_PID}/input-home`);

        await expect(page.getByTestId('app-error')).toBeVisible();
        await expect(page).toHaveURL(/#!\/error\//);
    });

    test.describe('no access (project owned by another user)', () => {
        let foreignId;

        test.beforeAll(async () => {
            // Seed a project owned by a different email with no invitation for the
            // fixed e2e user. No second browser identity is needed: the server
            // filters it out and answers 404 just like a missing project.
            foreignId = await seedForeignProject();
        });

        test.afterAll(async () => {
            if (foreignId) await deleteProject(foreignId);
        });

        test('a project the user is not invited to is not rendered (app error instead)', async ({
            page,
        }) => {
            await page.goto(`/app.html#!/projects/${foreignId}/input-home`);

            // The foreign project's content must never appear; we get the error page.
            await expect(page.getByTestId('app-error')).toBeVisible();
            await expect(page).toHaveURL(/#!\/error\//);
        });
    });
});
