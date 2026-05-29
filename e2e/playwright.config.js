import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

// Environment shared by the api / workers / frontend dev servers.
const serviceEnv = {
    ...process.env,
    ...dotenv.parse(readFileSync(resolve(here, '.env.e2e'))),
};

const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests',
    globalSetup: './global-setup.js',
    globalTeardown: './global-teardown.js',

    // Reporting/downloads block on async worker jobs, so be generous.
    timeout: 60_000,
    expect: { timeout: 15_000 },

    // One deterministic user/project is shared across specs.
    fullyParallel: false,
    workers: 1,
    retries: isCI ? 1 : 0,
    forbidOnly: isCI,

    reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],

    use: {
        baseURL: 'http://localhost:8080',
        actionTimeout: 15_000,
        trace: 'on-first-retry',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },

    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

    webServer: [
        {
            command: 'npm run serve',
            cwd: resolve(repoRoot, 'api'),
            url: 'http://localhost:8000/health/api',
            env: serviceEnv,
            timeout: 60_000,
            reuseExistingServer: !isCI,
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            command: 'npm run serve',
            cwd: resolve(repoRoot, 'workers'),
            // /health/workers enqueues a job and waits for a worker to run it:
            // a real readiness gate for the api <-> redis <-> workers chain.
            url: 'http://localhost:8000/health/workers',
            env: serviceEnv,
            timeout: 120_000,
            reuseExistingServer: !isCI,
            stdout: 'pipe',
            stderr: 'pipe',
        },
        {
            command: 'npm run start:e2e',
            cwd: resolve(repoRoot, 'frontend'),
            url: 'http://localhost:8080/app.html',
            env: serviceEnv,
            timeout: 180_000, // initial webpack build is slow
            reuseExistingServer: !isCI,
            stdout: 'pipe',
            stderr: 'pipe',
        },
    ],
});
