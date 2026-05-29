// Seeds deterministic data for the E2E suite:
//  - the fixed test user (so the API never auto-inserts a duplicate demo project)
//  - the Gondwana demo project (reusing the API's own insertDemoProject)
//  - a deterministic baseline project with fixed ids (added after reset)
//
// Run reset() first. Runnable standalone or imported by global-setup.js.
import { MongoClient } from 'mongodb';
import { MONGO_URI, MONGO_DB, TEST_EMAIL, TEST_SUB, COLLAB_EMAIL, COLLAB_SUB } from './constants.mjs';
import { insertDemoProject } from '../../api/src/storage/queries/project.js';
import { seedBaselineProject } from './seed-baseline.mjs';

// Insert a user document so the API's loadProfile finds it and never runs
// createUser (which would auto-insert another demo project for that identity).
async function seedUser(db, email, sub, name) {
    await db.collection('user').insertOne({
        _id: email,
        name: name || email.split('@')[0],
        picture: null,
        subs: [sub],
        lastSeen: new Date(),
    });
}

export async function seed() {
    const mongo = new MongoClient(MONGO_URI);
    try {
        await mongo.connect();
        const db = mongo.db(MONGO_DB);
        const io = { database: db };

        // Seed the test user up front (default identity) and the collaborator
        // (used by the invitation / multi-account specs). Seeding the collaborator
        // keeps the API from auto-creating a demo project for them.
        await seedUser(db, TEST_EMAIL, TEST_SUB, 'E2E');
        await seedUser(db, COLLAB_EMAIL, COLLAB_SUB);

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
