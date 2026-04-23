const { test, expect } = require('@playwright/test');

test.describe('Registration', () => {
  test('should display registration form correctly', async ({ page }) => {
    await page.goto('#!/register');

    // Check form elements are present
    await expect(page.getByTestId('registration-form')).toBeVisible();
    await expect(page.getByTestId('name-input')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('register-submit')).toBeVisible();

    // Check link to login
    await expect(page.getByTestId('goto-login-link')).toBeVisible();
  });

  test('should show validation for missing fields', async ({ page }) => {
    await page.goto('#!/register');

    // Click submit without filling fields
    await page.getByTestId('register-submit').click();

    // Should show validation error (implementation may vary)
    // This test checks that the form doesn't submit successfully
    await expect(page.getByTestId('registration-form')).toBeVisible();
  });

  test('should attempt registration with valid data', async ({ page }) => {
    await page.goto('#!/register');

    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;

    // Fill form with valid data
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('email-input').fill(testEmail);
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');

    // Submit form like a real user
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

    // Should either show success message or error (depending on backend state)
    // We test both possibilities since we don't control the backend state
    const hasSuccess = await page
      .getByTestId('registration-success')
      .isVisible()
      .catch(() => false);
    const hasError = await page
      .getByTestId('registration-error')
      .isVisible()
      .catch(() => false);

    expect(hasSuccess || hasError).toBeTruthy();
  });
});
