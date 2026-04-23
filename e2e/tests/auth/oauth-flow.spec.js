const { test, expect } = require('@playwright/test');
const { expectOAuthButtonsVisible } = require('../helpers/auth');

test.describe('OAuth Flow Integration', () => {
  test('should initiate Google OAuth flow when button clicked', async ({ page }) => {
    await page.goto('#!/login');
    await expectOAuthButtonsVisible(page);

    let googleOAuthRequested = false;
    page.on('request', request => {
      if (request.url().includes('/api/google')) {
        googleOAuthRequested = true;
      }
    });

    await page.getByText('Continue with Google').click();
    expect(googleOAuthRequested).toBeTruthy();
  });

  test('should initiate Microsoft OAuth flow when button clicked', async ({ page }) => {
    await page.goto('#!/login');
    await expectOAuthButtonsVisible(page);

    let microsoftOAuthRequested = false;
    page.on('request', request => {
      if (request.url().includes('/api/microsoft')) {
        microsoftOAuthRequested = true;
      }
    });

    await page.getByText('Continue with Microsoft').click();
    expect(microsoftOAuthRequested).toBeTruthy();
  });

  test('should have OAuth buttons on registration page too', async ({ page }) => {
    await page.goto('#!/register');
    await expectOAuthButtonsVisible(page);
  });

  test('should handle OAuth callback with error parameter', async ({ page }) => {
    await page.goto('#!/oauth-callback?error=access_denied');

    await expect(page.getByText('OAuth authentication failed')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Authentication Failed' })).toBeVisible();
  });

  test('should handle OAuth callback without token or error', async ({ page }) => {
    await page.goto('#!/oauth-callback');

    await expect(page.getByText('No authentication token received')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Authentication Failed' })).toBeVisible();
  });

  test('should show loading state in OAuth callback', async ({ page }) => {
    await page.route('**/api/me', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { email: 'test@example.com', name: 'Test User', picture: null },
        }),
      });
    });

    await page.goto('#!/oauth-callback?token=test-token');

    await expect(page.locator('i.fa-spinner')).toBeVisible();
    await expect(page.getByText('Completing sign in')).toBeVisible();
  });

  test('should show proper error UI elements', async ({ page }) => {
    await page.goto('#!/oauth-callback?error=access_denied');

    await expect(page.getByText('OAuth authentication failed')).toBeVisible();
    await expect(page.locator('.auth-container')).toBeVisible();
    await expect(page.locator('.panel')).toBeVisible();
    await expect(page.locator('i.fa-exclamation-triangle')).toBeVisible();
  });

  test('should display correct UI elements on OAuth callback page', async ({ page }) => {
    await page.goto('#!/oauth-callback?token=test-token');

    await expect(page.locator('.auth-container')).toBeVisible();
    await expect(page.locator('.panel')).toBeVisible();
  });
});
