// Doc use-case: initial-project-configuration (basic-information)
//
// Create a brand-new project from the projects list, fill its basic information,
// save, and verify the data is persisted (round-trip through API + Mongo) by
// reloading the app and finding the project in the list.
import { test, expect } from '../fixtures.js';

const NAME = 'E2E Created Project';
const COUNTRY = 'Testland';

test('create a project and persist its basic information', async ({ page }) => {
    await page.goto('/app.html#!/projects');
    await page.getByTestId('project-create-button').click();

    // Creating lands on the config home; open the "Basics" tab.
    await page.getByTestId('nav-config-basics').click();
    await page.getByTestId('basics-country').fill(COUNTRY);
    await page.getByTestId('basics-name').fill(NAME);
    await page.getByTestId('save-button').click();

    // Saving creates the project server-side and navigates away from "new".
    await expect(page).not.toHaveURL(/projects\/new\//);

    // Reload the whole app and confirm the project is listed (persisted).
    await page.goto('/app.html#!/projects');
    await expect(page.locator('text=' + NAME).first()).toBeVisible();
});
