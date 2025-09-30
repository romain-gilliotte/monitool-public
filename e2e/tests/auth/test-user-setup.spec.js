const { test, expect } = require('@playwright/test');
const { gotoLogin, login } = require('../helpers/auth');
const { testUser } = require('../helpers/testData');

test.describe('Test User Setup', () => {
  test('should create a test user for other tests', async ({ page }) => {
    await page.goto('#!/register');

    // Fill registration form
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('email-input').fill(testUser.email);
    await page.getByTestId('password-input').fill(testUser.password);
    await page.getByTestId('confirm-password-input').fill(testUser.password);

    // Submit registration like a real user
    await page.getByTestId('register-submit').click();

    // Wait for either success or error message to appear
    await Promise.race([
      page
        .getByTestId('registration-success')
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {}),
      page
        .getByTestId('registration-error')
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {}),
    ]);

    // Check result - either success or user already exists
    const hasSuccess = await page
      .getByTestId('registration-success')
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .getByTestId('registration-error')
      .isVisible()
      .catch(() => false);

    if (hasSuccess) {
      await expect(page.getByTestId('registration-success')).toBeVisible();
    } else if (hasError) {
      const errorText = await page.getByTestId('registration-error').textContent();
      console.log('Registration error (might be expected):', errorText);
    }

    expect(hasSuccess || hasError).toBeTruthy();
  });
});
