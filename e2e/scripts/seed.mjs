// Seeds deterministic data for the E2E suite:
//  - the fixed test user (so the API never auto-inserts a duplicate demo project)
//  - the Gondwana demo project (reusing the API's own insertDemoProject)
//  - a deterministic baseline project with fixed ids (added after reset)
//
// Run reset() first. Runnable standalone or imported by global-setup.js.
import { MongoClient } from 'mongodb';
import { MONGO_URI, MONGO_DB, TEST_EMAIL, TEST_SUB } from './constants.mjs';
import { insertDemoProject } from '../../api/src/storage/queries/project.js';
import { seedBaselineProject } from './seed-baseline.mjs';

export async function seed() {
    const mongo = new MongoClient(MONGO_URI);
    try {
        await mongo.connect();
        const db = mongo.db(MONGO_DB);
        const io = { database: db };

        // Seed the user up front: with the user present, the API's loadProfile
        // never runs createUser, so it never auto-inserts another demo project.
        await db.collection('user').insertOne({
            _id: TEST_EMAIL,
            name: 'E2E',
            picture: null,
            subs: [TEST_SUB],
            lastSeen: new Date(),
        });

        // Demo project (Gondwana) — used by the smoke spec. Dates are offset to
        // "now" by insertDemoProject, so we don't assert exact numbers on it.
        await insertDemoProject(io, TEST_EMAIL);

        // Deterministic baseline project (fixed ids, fixed dates) for the
        // data-entry / reporting / downloads specs.
        await seedBaselineProject(io, TEST_EMAIL);

        console.log('Seed: user + demo project + baseline project inserted.');
    } finally {
        await mongo.close().catch(() => {});
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    await seed();
}
