const { test, expect } = require('@playwright/test');
const { gotoLogin, login } = require('../helpers/auth');
const { testUser } = require('../helpers/testData');

test.describe('Login Flow', () => {
  test('should handle login flow correctly (verified or unverified)', async ({ page }) => {
    await gotoLogin(page);
    await login(page, testUser.email, testUser.password);

    // Deterministic wait: either projects page or error appears
    const projectsPromise = page.waitForURL(/.*#!\/projects/, { timeout: 10000 }).catch(() => {});
    const errorPromise = page
      .getByTestId('login-error')
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});
    await Promise.race([projectsPromise, errorPromise]);

    const isOnProjectsPage = page.url().includes('#!/projects');
    const hasLoginError = await page
      .getByTestId('login-error')
      .isVisible()
      .catch(() => false);

    if (isOnProjectsPage) {
      await expect(page.getByTestId('project-list-page')).toBeVisible();
    } else if (hasLoginError) {
      const errorText = await page.getByTestId('login-error').textContent();
      const isVerificationError =
        errorText.toLowerCase().includes('verify') || errorText.toLowerCase().includes('email');
      expect(isVerificationError).toBeTruthy();
    } else {
      throw new Error('Unexpected login state - no success and no error');
    }
  });

  test('should show loading state during login', async ({ page }) => {
    await gotoLogin(page);
    await login(page, testUser.email, testUser.password);

    // Button should briefly be disabled
    const submitButton = page.getByTestId('login-submit');
    await expect(submitButton).toBeDisabled();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept login request to simulate network error
    await page.route('**/api/login', route => route.abort('failed'));

    await gotoLogin(page);
    await login(page, testUser.email, testUser.password);

    // Should show error message
    await expect(page.getByTestId('login-error')).toBeVisible();
  });
});
