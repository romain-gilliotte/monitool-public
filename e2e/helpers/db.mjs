// Test-side database helpers: let specs set up deterministic state for the
// baseline project (clear/seed inputs, purge the reporting cache, manage
// invitations / uploads / revisions) and discover the demo project id. Specs run
// in Node, so they talk to mongo/redis directly via the same connection info as
// the seed scripts.
import { MongoClient, ObjectId } from 'mongodb';
import Redis from 'ioredis';
import {
    MONGO_URI,
    MONGO_DB,
    REDIS_URI,
    TEST_EMAIL,
    BASELINE_PROJECT_ID,
    BASELINE_SEQ_ID,
} from '../scripts/constants.mjs';
import {
    VARIABLE_ID,
    VARIABLE_PARTITIONED_ID,
    PARTITION_SEX_ID,
    PARTITION_AGE_ID,
    SEX_M_ID,
    SEX_F_ID,
    AGE_LT5_ID,
    AGE_GTE5_ID,
} from '../scripts/seed-baseline.mjs';

async function withMongo(fn) {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        return await fn(client.db(MONGO_DB));
    } finally {
        await client.close().catch(() => {});
    }
}

// The API stores reporting results under a single key per project and clears it
// on input writes (see api/src/routers/input.js). We clear it too, so a
// recomputation always reflects freshly seeded inputs.
export async function purgeReportingCacheFor(projectId) {
    const redis = new Redis(REDIS_URI, { lazyConnect: true, maxRetriesPerRequest: 1 });
    try {
        await redis.connect();
        await redis.del(`reporting:${projectId.toString()}`);
    } finally {
        redis.disconnect();
    }
}

export async function purgeReportingCache() {
    await purgeReportingCacheFor(BASELINE_PROJECT_ID);
}

// --- baseline (partition-free) variable inputs ------------------------------

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

// --- partitioned variable inputs (multi-partition spec) ---------------------

export async function resetPartitionedInputs() {
    await withMongo(db =>
        db
            .collection('input')
            .deleteMany({ sequenceId: BASELINE_SEQ_ID, 'content.variableId': VARIABLE_PARTITIONED_ID })
    );
    await purgeReportingCache();
}

// data is row-major over [Sex, Age]: [M&<5, M&>=5, F&<5, F&>=5].
export async function seedPartitionedInput(period, siteId, { mLt5, mGte5, fLt5, fGte5 }) {
    await withMongo(db =>
        db.collection('input').insertOne({
            sequenceId: BASELINE_SEQ_ID,
            author: TEST_EMAIL,
            content: [
                {
                    variableId: VARIABLE_PARTITIONED_ID,
                    dimensions: [
                        { id: 'time', attribute: 'month', items: [period] },
                        { id: 'location', attribute: 'entity', items: [siteId] },
                        { id: PARTITION_SEX_ID, attribute: 'element', items: [SEX_M_ID, SEX_F_ID] },
                        { id: PARTITION_AGE_ID, attribute: 'element', items: [AGE_LT5_ID, AGE_GTE5_ID] },
                    ],
                    data: [mLt5, mGte5, fLt5, fGte5],
                },
            ],
        })
    );
    await purgeReportingCache();
}

// --- baseline project document fields ---------------------------------------

export async function resetBaselineExtraIndicators() {
    await withMongo(db =>
        db.collection('project').updateOne({ _id: BASELINE_PROJECT_ID }, { $set: { extraIndicators: [] } })
    );
}

export async function resetBaselineActive() {
    await withMongo(db =>
        db.collection('project').updateOne({ _id: BASELINE_PROJECT_ID }, { $set: { active: true } })
    );
}

// The 'revision' collection is outside DATA_COLLECTIONS, so the global reset
// misses it; specs that produce revisions clean up here in beforeEach.
export async function resetBaselineRevisions() {
    await withMongo(db => db.collection('revision').deleteMany({ projectId: BASELINE_PROJECT_ID }));
}

// --- uploads ----------------------------------------------------------------

export async function resetBaselineUploads() {
    await withMongo(db =>
        db.collection('input_upload').deleteMany({ projectId: BASELINE_PROJECT_ID })
    );
}
// Alias (two designs named it differently); same single implementation.
export const resetUploads = resetBaselineUploads;

// Returns the _id (string) of the single pending upload for the baseline.
export async function getBaselineUploadId() {
    return withMongo(async db => {
        const docs = await db
            .collection('input_upload')
            .find({ projectId: BASELINE_PROJECT_ID }, { projection: { _id: 1 } })
            .toArray();
        if (docs.length !== 1) {
            throw new Error(`Expected exactly 1 baseline upload, found ${docs.length}`);
        }
        return docs[0]._id.toString();
    });
}

// --- invitations ------------------------------------------------------------

// projectId is stored as ObjectId so the project<->invitation $lookup matches.
export async function seedInvitation(projectId, email, accepted, dataEntry) {
    return withMongo(async db => {
        const res = await db.collection('invitation').insertOne({
            projectId: typeof projectId === 'string' ? new ObjectId(projectId) : projectId,
            email,
            accepted: !!accepted,
            ...(dataEntry ? { dataEntry } : {}),
        });
        return res.insertedId.toString();
    });
}

export async function resetBaselineInvitations() {
    await withMongo(db => db.collection('invitation').deleteMany({ projectId: BASELINE_PROJECT_ID }));
}

export async function getBaselineInvitations(email) {
    return withMongo(db =>
        db
            .collection('invitation')
            .find({ projectId: BASELINE_PROJECT_ID, ...(email ? { email } : {}) })
            .toArray()
    );
}

// --- foreign / arbitrary projects (error-states, clone cleanup) -------------

// A minimal valid project owned by someone else, with no invitation for the
// test user, so the test user gets a 404 / app-error when navigating to it.
export async function seedForeignProject(ownerEmail = 'someone-else@ngo.test') {
    return withMongo(async db => {
        const res = await db.collection('project').insertOne({
            owner: ownerEmail,
            name: 'Foreign NGO Project',
            country: 'Elsewhere',
            active: true,
            start: '2020-01-01',
            end: '2020-12-31',
            entities: [],
            groups: [],
            forms: [],
            logicalFrames: [],
            extraIndicators: [],
        });
        return res.insertedId.toString();
    });
}

export async function deleteProject(projectId) {
    await withMongo(db =>
        db.collection('project').deleteOne({ _id: new ObjectId(projectId) })
    );
}

// --- discovery --------------------------------------------------------------

export async function getDemoProjectId() {
    return withMongo(async db => {
        const project = await db
            .collection('project')
            .findOne(
                { _id: { $ne: BASELINE_PROJECT_ID }, owner: TEST_EMAIL },
                { projection: { _id: 1 } }
            );
        if (!project) throw new Error('Demo project not found (seed did not run?)');
        return project._id.toString();
    });
}
