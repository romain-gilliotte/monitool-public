// Doc use-case: initial-project-configuration/sites
//   - Adding a site
//   - Grouping sites
//   - Handling inactive or closed sites (Delete)
//
// Drive the sites authoring screen on a freshly created project (cleaner than the
// shared baseline for add/delete): add a site, rename it, create a group, then
// delete the site, asserting persistence after a full app reload each time
// (round-trip UI -> PUT /project -> Mongo). Sites/groups live on the project
// document, so there is no async worker and no reporting cache to purge.
//
// Site/group ids are uuid()-minted client-side at add time, so the spec discovers
// them at runtime from the row's data-site-id / data-group-id attribute and then
// targets the id-keyed testids.
import { test, expect } from '../fixtures.js';
import { waitProjectSaved, waitProjectCreated } from '../helpers/responses.mjs';

const PROJECT_NAME = 'E2E Sites Authoring Project';
const COUNTRY = 'Testland';
const SITE_NAME = 'Bossangoa Health Center';
const SITE_RENAMED = 'Bossangoa Hospital';
const GROUP_NAME = 'Northern Region';

test('add, rename, group and delete sites on a fresh project', async ({ page }) => {
    // Native window.confirm dialogs: delete-site confirmation and the
    // "unsaved changes" guard. Always accept.
    page.on('dialog', dialog => dialog.accept());

    // --- Create a fresh project so the sites table starts empty. ---
    await page.goto('/app.html#!/projects');
    await page.getByTestId('project-create-button').click();

    await page.getByTestId('nav-config-basics').click();
    await page.getByTestId('basics-country').fill(COUNTRY);
    await page.getByTestId('basics-name').fill(PROJECT_NAME);
    await Promise.all([waitProjectCreated(page), page.getByTestId('save-button').click()]);
    await expect(page).not.toHaveURL(/projects\/new\//);

    // Capture the new project id from the URL for a deterministic reload target.
    const pid = page.url().match(/projects\/([^/]+)\//)[1];

    // --- Add a site. ---
    await page.getByTestId('nav-config-sites').click();
    await page.getByTestId('site-add-button').click();

    // Fresh project => exactly one site row after one add. Read its generated id.
    const siteRow = page.locator('[data-testid^="site-row-"]');
    await expect(siteRow).toHaveCount(1);
    const siteId = await siteRow.getAttribute('data-site-id');

    await page.getByTestId(`site-name-input-${siteId}`).fill(SITE_NAME);
    await Promise.all([waitProjectSaved(page), page.getByTestId('save-button').click()]);

    // Reload the whole app; the site name must have persisted.
    await page.goto(`/app.html#!/projects/${pid}/sites`);
    await expect(page.getByTestId(`site-name-input-${siteId}`)).toHaveValue(SITE_NAME);

    // --- Rename the site. ---
    await page.getByTestId(`site-name-input-${siteId}`).fill(SITE_RENAMED);
    await Promise.all([waitProjectSaved(page), page.getByTestId('save-button').click()]);

    await page.goto(`/app.html#!/projects/${pid}/sites`);
    await expect(page.getByTestId(`site-name-input-${siteId}`)).toHaveValue(SITE_RENAMED);

    // --- Create a group containing the site. ---
    // A memberless group is invalid (save stays disabled), so we must pick a member.
    await page.getByTestId('group-add-button').click();
    const groupRow = page.locator('[data-testid^="group-row-"]');
    await expect(groupRow).toHaveCount(1);
    const groupId = await groupRow.getAttribute('data-group-id');

    await page.getByTestId(`group-name-input-${groupId}`).fill(GROUP_NAME);

    // The members picker is a ui-select widget (library-rendered): the testid is
    // on the <ui-select> container. Open it, then click the choice by visible name.
    const memberSelect = page.getByTestId(`group-members-select-${groupId}`);
    await memberSelect.click();
    await memberSelect.locator('input.ui-select-search').fill(SITE_RENAMED);
    await page
        .locator('.ui-select-choices-row', { hasText: SITE_RENAMED })
        .first()
        .click();

    await Promise.all([waitProjectSaved(page), page.getByTestId('save-button').click()]);

    await page.goto(`/app.html#!/projects/${pid}/sites`);
    await expect(page.getByTestId(`group-name-input-${groupId}`)).toHaveValue(GROUP_NAME);

    // --- Delete the site (accepts the window.confirm via the dialog handler). ---
    // The delete action lives in the row's Bootstrap dropdown; open it first.
    await page.getByTestId(`site-row-${siteId}`).locator('[uib-dropdown-toggle]').click();
    await page.getByTestId(`site-delete-button-${siteId}`).click();
    await expect(page.getByTestId(`site-row-${siteId}`)).toHaveCount(0);

    await Promise.all([waitProjectSaved(page), page.getByTestId('save-button').click()]);

    // Reload: the site must be gone (no row keyed by its id).
    await page.goto(`/app.html#!/projects/${pid}/sites`);
    await expect(page.getByTestId(`site-name-input-${siteId}`)).toHaveCount(0);
});
