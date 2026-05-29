// Doc use-case: getting-started/basic-navigation — "Multi-lingual support"
//
// Switch the UI language (EN -> FR -> ES -> back to EN) via the language
// selector in the left menu of the project-selection screen, asserting that a
// stable, translated menu label changes accordingly. angular-translate swaps
// catalogs in place (no navigation), so we assert on the same data-testid
// element's text after each switch.
//
// IMPORTANT: changeLanguage() does NOT update <html lang>, so the html lang
// attribute is NOT a valid oracle — we assert on translated text instead. The
// chosen language is persisted to localStorage (NG_TRANSLATE_LANG_KEY); since the
// suite runs serially this spec restores English at the end so later specs keep
// seeing English labels.
import { test, expect } from '../fixtures.js';

// Translated values of shared.project_list across the three supported locales.
const PROJECT_LIST_LABEL = {
    en: 'Projects list',
    fr: 'Liste des projets',
    es: 'Lista de proyectos',
};

// Open the language dropdown, then click the option for `lang`. The uib-dropdown
// toggle closes after each selection, so this re-opens it every time. The option
// for the currently-active language is hidden (ng-if="$root.language != lang"),
// which is fine: we only ever click a language that is not the current one.
async function switchLanguageTo(page, lang) {
    await page.getByTestId('menu-language-toggle').click();
    await page.getByTestId(`menu-language-${lang}`).click();
}

test.afterEach(async ({ page }) => {
    // Guard against leaking a non-English language into later (serial) specs:
    // ensure we end on English regardless of how the test finished.
    const label = page.getByTestId('menu-link-project-list');
    if ((await label.count()) > 0 && (await label.innerText()) !== PROJECT_LIST_LABEL.en) {
        await switchLanguageTo(page, 'en');
        await expect(label).toHaveText(PROJECT_LIST_LABEL.en);
    }
});

test('switch the UI language from the project-selection left menu', async ({ page }) => {
    await page.goto('/app.html#!/projects');

    const projectListLabel = page.getByTestId('menu-link-project-list');
    await expect(projectListLabel).toBeVisible();

    // Baseline: the app boots in English. If a prior run leaked another language
    // into localStorage, normalise to English first so the journey is deterministic.
    if ((await projectListLabel.innerText()) !== PROJECT_LIST_LABEL.en) {
        await switchLanguageTo(page, 'en');
    }
    await expect(projectListLabel).toHaveText(PROJECT_LIST_LABEL.en);

    // EN -> FR
    await switchLanguageTo(page, 'fr');
    await expect(projectListLabel).toHaveText(PROJECT_LIST_LABEL.fr);

    // FR -> ES
    await switchLanguageTo(page, 'es');
    await expect(projectListLabel).toHaveText(PROJECT_LIST_LABEL.es);

    // ES -> EN (also restores the serial-suite default language).
    await switchLanguageTo(page, 'en');
    await expect(projectListLabel).toHaveText(PROJECT_LIST_LABEL.en);
});
