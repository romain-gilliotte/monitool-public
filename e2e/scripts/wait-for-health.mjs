// Polls the API health endpoints until the whole chain is ready
// (api -> mongo -> redis -> workers). Exported for use by global-setup.js,
// and runnable standalone: `node scripts/wait-for-health.mjs`.
const BASE = process.env.MONITOOL_API_URL || 'http://localhost:8000';
const ENDPOINTS = ['/health/api', '/health/database', '/health/caching', '/health/workers'];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function probe(path) {
    try {
        const res = await fetch(BASE + path);
        return res.ok;
    } catch {
        return false;
    }
}

export async function waitForHealth(timeoutMs = 120000) {
    const deadline = Date.now() + timeoutMs;
    const pending = new Set(ENDPOINTS);
    while (Date.now() < deadline) {
        for (const path of [...pending]) {
            if (await probe(path)) {
                pending.delete(path);
                console.log(`  ✓ ${path}`);
            }
        }
        if (pending.size === 0) return;
        await sleep(2000);
    }
    throw new Error(`Health checks timed out, still failing: ${[...pending].join(', ')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await waitForHealth();
    console.log('All health checks passed.');
}
