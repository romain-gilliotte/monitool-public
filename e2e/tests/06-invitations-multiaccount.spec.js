// Doc use-case: initial-project-configuration/invite-other-users
//
// Two halves, both runnable thanks to the identity-in-token auth bypass:
//   1. Owner-side: open the project's Invitations tab, invite a user by email
//      through the modal, assert the invitation row appears and persists, then
//      revoke it.
//   2. Cross-identity: the owner invites the seeded collaborator, who — in a
//      separate browser context (asUser) — cannot open the project until they
//      accept the invitation from their own invitations page, after which the
//      shared project becomes accessible.
//
// POST/PUT/DELETE /invitation are plain Koa routes (no Bull worker), so we wait
// on the HTTP response, never a timeout.
import { test, expect } from '../fixtures.js';
import { resetBaselineInvitations, getBaselineInvitations } from '../helpers/db.mjs';
import { BASELINE_PROJECT_ID, COLLAB_EMAIL } from '../scripts/constants.mjs';

const PID = BASELINE_PROJECT_ID.toString();
const INVITEE = 'invitee@monitool.test';

test.beforeEach(async () => {
    await resetBaselineInvitations();
});

test('owner invites a user by email, the invitation appears and persists, then is revoked', async ({
    page,
}) => {
    // Open the Invitations tab from the project config menu.
    await page.goto(`/app.html#!/projects/${PID}/invitations`);

    // Empty state: the add link is shown and no invitation rows exist yet.
    await expect(page.getByTestId('invitation-empty-add')).toBeVisible();
    await expect(page.getByTestId(`invitation-row-${INVITEE}`)).toHaveCount(0);

    // Open the invite modal and fill the invitee email. Site/datasource filters
    // default to all-selected (set in the modal's $onChanges), so no extra input.
    await page.getByTestId('invitation-empty-add').click();
    await page.getByTestId('invitation-modal-email').fill(INVITEE);

    // Submit and wait for the invitation to be persisted (POST /invitation).
    await Promise.all([
        page.waitForResponse(
            r => r.request().method() === 'POST' && /\/invitation(\?|$)/.test(r.url()) && r.ok()
        ),
        page.getByTestId('invitation-modal-submit').click(),
    ]);

    // The row appears, keyed by the (stable) email business id, and is pending.
    await expect(page.getByTestId(`invitation-row-${INVITEE}`)).toBeVisible();

    // DB-level assertion: the invitation is stored against the baseline project,
    // pending, with the default data-entry scope (all sites + all data sources).
    const stored = await getBaselineInvitations(INVITEE);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ email: INVITEE, accepted: false });
    expect(stored[0].dataEntry.siteIds.length).toBeGreaterThan(0);
    expect(stored[0].dataEntry.dataSourceIds.length).toBeGreaterThan(0);

    // Persistence: reload the whole app on the invitations tab; the row survives.
    await page.goto(`/app.html#!/projects/${PID}/invitations`);
    await expect(page.getByTestId(`invitation-row-${INVITEE}`)).toBeVisible();

    // Revoke via the row's dropdown and wait for DELETE /invitation/{id}.
    await page.getByTestId(`invitation-revoke-toggle-${INVITEE}`).click();
    await Promise.all([
        page.waitForResponse(
            r =>
                r.request().method() === 'DELETE' &&
                /\/invitation\/[^/]+(\?|$)/.test(r.url()) &&
                r.ok()
        ),
        page.getByTestId(`invitation-revoke-${INVITEE}`).click(),
    ]);

    // The empty state returns and the DB no longer holds the invitation.
    await expect(page.getByTestId('invitation-empty-add')).toBeVisible();
    expect(await getBaselineInvitations(INVITEE)).toHaveLength(0);
});

test('an invited user accepts and gains access to the shared project', async ({ page, asUser }) => {
    // --- Owner invites the seeded collaborator. ---
    await page.goto(`/app.html#!/projects/${PID}/invitations`);
    await page.getByTestId('invitation-empty-add').click();
    await page.getByTestId('invitation-modal-email').fill(COLLAB_EMAIL);
    await Promise.all([
        page.waitForResponse(
            r => r.request().method() === 'POST' && /\/invitation(\?|$)/.test(r.url()) && r.ok()
        ),
        page.getByTestId('invitation-modal-submit').click(),
    ]);
    await expect(page.getByTestId(`invitation-row-${COLLAB_EMAIL}`)).toBeVisible();

    // --- The collaborator, in their own browser context, does not yet see the
    //     shared project in their list (the invitation is still pending). ---
    const collab = await asUser(COLLAB_EMAIL);
    await collab.goto('/app.html#!/projects');
    // The project-cards container is hidden when empty, so anchor on the always-
    // present create button to confirm the list loaded, then assert no baseline.
    await expect(collab.getByTestId('project-create-button')).toBeVisible();
    await expect(collab.getByTestId(`project-open-${PID}`)).toHaveCount(0);

    // --- They see the pending invitation on their invitations page and accept it. ---
    await collab.goto('/app.html#!/invitations');
    const acceptBtn = collab.getByTestId(`invitation-accept-${PID}`);
    await expect(acceptBtn).toBeVisible();
    await Promise.all([
        collab.waitForResponse(
            r =>
                r.request().method() === 'PUT' &&
                /\/invitation\/[^/]+(\?|$)/.test(r.url()) &&
                r.ok()
        ),
        acceptBtn.click(),
    ]);

    // --- The shared project now appears in the collaborator's project list. A
    //     full reload forces a fresh listProjects fetch (the in-app navigation
    //     after accepting can otherwise keep the pre-accept, empty list). ---
    await collab.goto('/app.html#!/projects');
    await collab.reload();
    await expect(collab.getByTestId(`project-open-${PID}`)).toBeVisible();
    await expect(collab.getByTestId('app-error')).toHaveCount(0);

    // And the API now records the invitation as accepted.
    const stored = await getBaselineInvitations(COLLAB_EMAIL);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ email: COLLAB_EMAIL, accepted: true });
});
