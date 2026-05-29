// Shared constants for the E2E harness: connection info, the fixed test user,
// and the deterministic baseline project identifiers used by seed/reset and specs.
import { ObjectId } from 'mongodb';

export const MONGO_URI = process.env.MONITOOL_MONGO_URI || 'mongodb://localhost:27017';
export const MONGO_DB = process.env.MONITOOL_MONGO_DB || 'monitool';
export const REDIS_URI = process.env.MONITOOL_REDIS_URI || 'redis://127.0.0.1:6379/0';

// Must match the identity-in-token bypass in api/src/middlewares/load-profile.js
// and frontend/src/index.js. The API derives sub = `e2e|${email}` from the
// token, so TEST_SUB must be kept in sync or loadProfile re-runs createUser.
export const TEST_EMAIL = 'e2e@monitool.test';
export const TEST_SUB = `e2e|${TEST_EMAIL}`;

// A second seeded identity, used by the invitation / multi-account specs via
// the fixtures' asUser() helper.
export const COLLAB_EMAIL = 'collab@monitool.test';
export const COLLAB_SUB = `e2e|${COLLAB_EMAIL}`;

// Collections owned by a user's data; dropped on reset.
export const DATA_COLLECTIONS = [
    'project',
    'input',
    'input_seq',
    'invitation',
    'input_upload',
    'user',
];

// Deterministic baseline project (fixed ids so specs and reporting are stable).
export const BASELINE_PROJECT_ID = new ObjectId('e2e00000000000000000aa01');
export const BASELINE_SEQ_ID = new ObjectId('e2e00000000000000000bb01');
