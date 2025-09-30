const { test, expect } = require('@playwright/test');

test.describe('Monitool Basic Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check that the page title contains "Monitool" or similar
    await expect(page).toHaveTitle(/Monitool/i);
  });
});
