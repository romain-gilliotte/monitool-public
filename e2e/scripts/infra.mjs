// Brings the E2E backing services (MongoDB replica set + Redis) up or down.
//
//   node scripts/infra.mjs up     # docker compose up -d + rs.initiate + wait PRIMARY
//   node scripts/infra.mjs down   # docker compose down -v
//
// Replica-set init is done from the host via the mongodb driver (directConnection)
// so we don't depend on which shell ships inside the mongo:5 image.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { MongoClient } from 'mongodb';

const here = dirname(fileURLToPath(import.meta.url));
const composeFile = join(here, '..', 'docker-compose.e2e.yml');
const MONGO_DIRECT = 'mongodb://localhost:27017/?directConnection=true';

const sleep = ms => new Promise(r => setTimeout(r, ms));

function compose(...args) {
    execFileSync('docker', ['compose', '-f', composeFile, ...args], { stdio: 'inherit' });
}

async function waitForMongo(timeoutMs = 60000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const client = new MongoClient(MONGO_DIRECT, { serverSelectionTimeoutMS: 1000 });
        try {
            await client.connect();
            await client.db('admin').command({ ping: 1 });
            return;
        } catch {
            await sleep(1000);
        } finally {
            await client.close().catch(() => {});
        }
    }
    throw new Error('MongoDB did not become reachable in time');
}

async function initReplicaSet() {
    const client = new MongoClient(MONGO_DIRECT, { serverSelectionTimeoutMS: 2000 });
    try {
        await client.connect();
        const admin = client.db('admin');
        try {
            await admin.command({
                replSetInitiate: { _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] },
            });
            console.log('Replica set rs0 initiated.');
        } catch (e) {
            if (/already initialized/i.test(e.message) || e.codeName === 'AlreadyInitialized') {
                console.log('Replica set rs0 already initialized.');
            } else {
                throw e;
            }
        }
    } finally {
        await client.close().catch(() => {});
    }
}

async function waitForPrimary(timeoutMs = 60000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const client = new MongoClient(MONGO_DIRECT, { serverSelectionTimeoutMS: 1000 });
        try {
            await client.connect();
            const res = await client.db('admin').command({ hello: 1 });
            if (res.isWritablePrimary) {
                console.log('Replica set has a writable PRIMARY.');
                return;
            }
        } catch {
            // not ready yet
        } finally {
            await client.close().catch(() => {});
        }
        await sleep(1000);
    }
    throw new Error('Replica set did not elect a PRIMARY in time');
}

async function up() {
    compose('up', '-d');
    await waitForMongo();
    await initReplicaSet();
    await waitForPrimary();
    console.log('Infra is up (MongoDB rs0 + Redis).');
}

function down() {
    compose('down', '-v');
    console.log('Infra is down.');
}

const cmd = process.argv[2];
if (cmd === 'up') {
    await up();
} else if (cmd === 'down') {
    down();
} else {
    console.error('Usage: node scripts/infra.mjs <up|down>');
    process.exit(1);
}
