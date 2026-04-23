const { test, expect } = require('@playwright/test');
const { ensureAngularApp } = require('../helpers/navigation');
const { expectLoginFormVisible } = require('../helpers/auth');

test.describe('Auth Navigation', () => {
  test('should navigate from login to registration', async ({ page }) => {
    await page.goto('#!/login');
    await expectLoginFormVisible(page);

    await expect(page.getByTestId('register-link')).toBeVisible();
    await page.getByTestId('register-link').click();

    await expect(page).toHaveURL(/.*#!\/register/);
    await expect(page.getByTestId('registration-form')).toBeVisible();
  });

  test('should navigate from registration to login', async ({ page }) => {
    await page.goto('#!/register');

    await expect(page.getByTestId('registration-form')).toBeVisible();
    await expect(page.getByTestId('goto-login-link')).toBeVisible();

    await page.getByTestId('goto-login-link').click();

    await expect(page).toHaveURL(/.*#!\/login/);
    await expectLoginFormVisible(page);
  });

  test('should navigate to forgot password', async ({ page }) => {
    await page.goto('#!/login');
    await expectLoginFormVisible(page);
    await expect(page.getByTestId('forgot-password-link')).toBeVisible();

    await page.getByTestId('forgot-password-link').click();

    await expect(page).toHaveURL(/.*#!\/forgot-password/);
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await ensureAngularApp(page);

    await expect(page).toHaveURL(/.*#!\/login/);
    await expectLoginFormVisible(page);
  });
});
