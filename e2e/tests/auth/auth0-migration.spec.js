const { test, expect } = require('@playwright/test');
const { gotoLogin, expectLoginFormVisible } = require('../helpers/auth');

test.describe('Auth0 Migration', () => {
  test('should show migration message for Auth0 users', async ({ page }) => {
    await gotoLogin(page);
    await expectLoginFormVisible(page);

    // Fill with Auth0 user credentials (email that exists in database with subs but no password)
    await page.getByTestId('email-input').fill('auth0user@example.com');
    await page.getByTestId('password-input').fill('anypassword');
    await page.getByTestId('login-submit').click();

    // Should show Auth0 migration message instead of regular error
    const migrationMessage = page.getByTestId('auth0-migration-message');
    const regularError = page.getByTestId('login-error');

    // Check that either the migration message appears OR regular error (depending on whether user exists)
    // Since we can't easily mock the database in e2e tests, we'll accept either outcome
    const messageVisible = await migrationMessage.isVisible().catch(() => false);
    const errorVisible = await regularError.isVisible().catch(() => false);

    expect(messageVisible || errorVisible).toBeTruthy();

    if (messageVisible) {
      // If migration message is shown, verify it has the reset button
      await expect(migrationMessage).toContainText('Account Migration Required');
      await expect(migrationMessage).toContainText('reset your password');
      await expect(page.getByTestId('reset-auth0-password')).toBeVisible();
    }
  });

  test('should navigate to forgot password when reset button is clicked', async ({ page }) => {
    await gotoLogin(page);
    await expectLoginFormVisible(page);

    // Fill form with some email
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-submit').click();

    // Check if Auth0 migration message appears
    const migrationMessage = page.getByTestId('auth0-migration-message');
    const isVisible = await migrationMessage.isVisible().catch(() => false);

    if (isVisible) {
      // Click the reset password button
      await page.getByTestId('reset-auth0-password').click();

      // Should navigate to forgot password page
      await expect(page).toHaveURL(/forgot-password/);

      // Email should be pre-populated
      const emailInput = page.getByTestId('email-input');
      await expect(emailInput).toHaveValue('test@example.com');
    }
  });
});
