// Test-side database helpers: let specs set up deterministic state for the
// baseline project (clear/seed inputs, purge the reporting cache) and discover
// the demo project id. Specs run in Node, so they can talk to mongo/redis
// directly via the same connection info as the seed scripts.
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import {
    MONGO_URI,
    MONGO_DB,
    REDIS_URI,
    TEST_EMAIL,
    BASELINE_PROJECT_ID,
    BASELINE_SEQ_ID,
} from '../scripts/constants.mjs';
import { VARIABLE_ID } from '../scripts/seed-baseline.mjs';

async function withMongo(fn) {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        return await fn(client.db(MONGO_DB));
    } finally {
        await client.close().catch(() => {});
    }
}

// The API stores reporting results under a single hash key per project and
// clears it on input writes (see api/src/routers/input.js). We clear it too,
// so a recomputation always reflects freshly seeded inputs.
export async function purgeReportingCache() {
    const redis = new Redis(REDIS_URI, { lazyConnect: true, maxRetriesPerRequest: 1 });
    try {
        await redis.connect();
        await redis.del(`reporting:${BASELINE_PROJECT_ID.toString()}`);
    } finally {
        redis.disconnect();
    }
}

export async function resetBaselineInputs() {
    await withMongo(db => db.collection('input').deleteMany({ sequenceId: BASELINE_SEQ_ID }));
    await purgeReportingCache();
}

export async function seedBaselineInput(period, siteId, value) {
    await withMongo(db =>
        db.collection('input').insertOne({
            sequenceId: BASELINE_SEQ_ID,
            author: TEST_EMAIL,
            content: [
                {
                    variableId: VARIABLE_ID,
                    dimensions: [
                        { id: 'time', attribute: 'month', items: [period] },
                        { id: 'location', attribute: 'entity', items: [siteId] },
                    ],
                    data: [value],
                },
            ],
        })
    );
    await purgeReportingCache();
}

export async function getDemoProjectId() {
    return withMongo(async db => {
        const project = await db
            .collection('project')
            .findOne({ _id: { $ne: BASELINE_PROJECT_ID }, owner: TEST_EMAIL }, { projection: { _id: 1 } });
        if (!project) throw new Error('Demo project not found (seed did not run?)');
        return project._id.toString();
    });
}
