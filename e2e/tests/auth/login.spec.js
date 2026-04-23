const { test, expect } = require('@playwright/test');
const { expectLoginFormVisible } = require('../helpers/auth');

test.describe('Login', () => {
  test('should display login form correctly', async ({ page }) => {
    await page.goto('#!/login');
    await expectLoginFormVisible(page);

    // Check links are present
    await expect(page.getByTestId('register-link')).toBeVisible();
    await expect(page.getByTestId('forgot-password-link')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.goto('#!/login');
    await expectLoginFormVisible(page);

    // Click submit without filling fields
    await page.getByTestId('login-submit').click();

    // Should show error message
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText('Please fill in all fields');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('#!/login');
    await expectLoginFormVisible(page);

    // Fill with invalid credentials
    await page.getByTestId('email-input').fill('invalid@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-submit').click();

    // Should show authentication error
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText(
      /Invalid email or password|Authentication failed/i
    );
  });
});
