# Monitool E2E Tests

This package contains end-to-end tests for the Monitool application using Playwright.

## Setup

The e2e tests are automatically set up when the devcontainer is built. Google Chrome is installed in the devcontainer, and Playwright dependencies are installed automatically.

## Running Tests

Make sure both the API and frontend servers are running before executing tests:

```bash
# Terminal 1: Start the API server
cd api && npm start

# Terminal 2: Start the frontend development server
cd frontend && npm start

# Terminal 3: Run e2e tests
cd e2e && npm test
```

## Available Commands

- `npm test` - Run all tests in headless mode
- `npm run test:headed` - Run tests in headed mode (with browser UI)
- `npm run test:debug` - Run tests in debug mode
- `npm run test:ui` - Run tests with Playwright UI mode
- `npm run report` - Show test report
- `npm run install-deps` - Install Playwright browser dependencies

## Test Configuration

Tests are configured to:

- Run against `http://localhost:8080` (the frontend development server)
- Use Chrome in headless mode by default
- Take screenshots on failure
- Record videos on failure
- Generate HTML reports

## Writing Tests

Tests are located in the `tests/` directory. Use the `.spec.js` extension for test files.

Example test structure:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code here
  });
});
```

## CI/CD

The tests are configured to work in CI environments with appropriate retry logic and parallelization settings.
