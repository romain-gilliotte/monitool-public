// Shared Playwright fixtures for the monitool E2E suite.
//
// Two things are injected via addInitScript (which runs before the AngularJS app
// boots, on every navigation):
//   - `help_disclaimer_shown_new` localStorage flag, to suppress the first-login
//     onboarding tour (an Arcade iframe overlay opened by the project list).
//   - `window.__E2E_USER__`, the identity this browser context authenticates as.
//     The frontend bypass encodes it into the token (`e2e:<email>`) and the API
//     derives the same identity, so each context is an independent logged-in user.
//
// Most specs just use `page` (the default `e2e@monitool.test` identity). Specs
// that need another user set `test.use({ userEmail: '...' })` at the top of the
// file, or open extra identities at runtime with the `asUser(email)` fixture.
import { test as base, expect } from '@playwright/test';

const DEFAULT_EMAIL = 'e2e@monitool.test';

function identityInitScripts(context, email) {
    return context.addInitScript(
        ({ email }) => {
            try {
                window.localStorage.setItem('help_disclaimer_shown_new', 'true');
                window.__E2E_USER__ = { email, name: email.split('@')[0] };
            } catch {
                // ignore (storage may be unavailable before navigation)
            }
        },
        { email }
    );
}

export const test = base.extend({
    // Overridable per-test/per-file: test.use({ userEmail: 'collab@monitool.test' })
    userEmail: [DEFAULT_EMAIL, { option: true }],

    page: async ({ page, userEmail }, use) => {
        await identityInitScripts(page.context(), userEmail);
        await use(page);
    },

    // Ergonomic multi-user helper: `const collab = await asUser('collab@monitool.test')`
    // returns a page in a fresh, isolated browser context already authenticated as
    // that identity. All such contexts are closed at the end of the test.
    asUser: async ({ browser }, use) => {
        const contexts = [];
        const open = async email => {
            const ctx = await browser.newContext();
            await identityInitScripts(ctx, email);
            contexts.push(ctx);
            return ctx.newPage();
        };
        await use(open);
        for (const c of contexts) await c.close();
    },
});

export { expect };
