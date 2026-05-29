// Shared Playwright fixtures for the monitool E2E suite.
//
// The `page` fixture is extended to suppress the first-login onboarding tour
// (an Arcade iframe overlay opened by the project list when the
// `help_disclaimer_shown_new` localStorage flag is absent). We set the flag via
// addInitScript so it is present before the AngularJS app boots, on every page.
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
    page: async ({ page }, use) => {
        await page.addInitScript(() => {
            try {
                window.localStorage.setItem('help_disclaimer_shown_new', 'true');
            } catch {
                // ignore (storage may be unavailable before navigation)
            }
        });
        await use(page);
    },
});

export { expect };
