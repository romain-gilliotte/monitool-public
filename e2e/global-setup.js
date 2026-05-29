// Runs once before the test suite: load the E2E env, wipe user-owned data and
// the reporting cache, then seed deterministic fixtures (test user + demo +
// baseline project). Backing services are brought up by the `pretest` script
// (scripts/infra.mjs up); the api/workers/frontend dev servers are managed by
// Playwright's `webServer`.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

const here = dirname(fileURLToPath(import.meta.url));

export default async function globalSetup() {
    // Load .env.e2e so the seed/reset scripts connect to the right mongo/redis.
    for (const [k, v] of Object.entries(dotenv.parse(readFileSync(resolve(here, '.env.e2e'))))) {
        if (process.env[k] === undefined) process.env[k] = v;
    }

    const { reset } = await import('./scripts/reset.mjs');
    const { seed } = await import('./scripts/seed.mjs');

    console.log('[global-setup] resetting database…');
    await reset();
    console.log('[global-setup] seeding fixtures…');
    await seed();
    console.log('[global-setup] done.');
}
