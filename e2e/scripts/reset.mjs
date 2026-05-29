// Drops all user-owned data and purges the Redis reporting cache so each test
// run starts from a deterministic, empty state. Runnable standalone or imported.
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import { MONGO_URI, MONGO_DB, REDIS_URI, DATA_COLLECTIONS } from './constants.mjs';

export async function reset() {
    const mongo = new MongoClient(MONGO_URI);
    const redis = new Redis(REDIS_URI, { lazyConnect: true, maxRetriesPerRequest: 1 });
    try {
        await mongo.connect();
        const db = mongo.db(MONGO_DB);
        for (const name of DATA_COLLECTIONS) {
            await db.collection(name).deleteMany({});
        }

        await redis.connect();
        const keys = await redis.keys('reporting:*');
        if (keys.length) await redis.del(keys);

        console.log(`Reset: cleared ${DATA_COLLECTIONS.length} collections + ${keys.length} reporting cache keys.`);
    } finally {
        await mongo.close().catch(() => {});
        redis.disconnect();
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await reset();
}
