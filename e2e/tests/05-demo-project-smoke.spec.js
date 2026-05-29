// Doc use-case: getting-started/the-gondwana-project + basic-navigation
//
// Open the auto-provisioned Gondwana demo project and walk its main screens,
// asserting none of them lands on the error state. No numeric assertions: the
// demo's dates are offset to "now", so values are not deterministic.
import { test, expect } from '../fixtures.js';
import { getDemoProjectId } from '../helpers/db.mjs';

test('the demo project loads across its main screens without error', async ({ page }) => {
    const demoId = await getDemoProjectId();

    await page.goto(`/app.html#!/projects/${demoId}/input-home`);
    await expect(page.getByTestId('nav-usage-home')).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    await page.getByTestId('nav-usage-reporting-general').click();
    await expect(page.getByTestId('reporting-table')).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    await page.getByTestId('nav-usage-olap').click();
    await expect(page.getByTestId('olap-table')).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);

    await page.getByTestId('nav-usage-downloads').click();
    await expect(page.getByTestId('downloads-section-excel')).toBeVisible();
    await expect(page.getByTestId('app-error')).toHaveCount(0);
});
