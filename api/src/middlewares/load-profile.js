import jwksRsa from 'jwks-rsa';
import koaJwt from 'koa-jwt';
import { LRUCache } from 'lru-cache';
import { ObjectId } from 'mongodb';
import config from '../config.js';
import { getProject, insertDemoProject } from '../storage/queries/project.js';
const cache = new LRUCache({ max: 150, ttl: 10 * 60 * 1000 });

async function fetchUserInfo(token) {
    const bearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    const res = await fetch(`https://${config.jwt.jwksHost}/userinfo`, {
        headers: { Authorization: bearer },
    });
    if (!res.ok) throw new Error(`Failed to fetch user profile (HTTP ${res.status})`);
    return res.json();
}

const verifyToken = koaJwt({
    secret: jwksRsa.koaJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 2,
        jwksUri: `https://${config.jwt.jwksHost}/.well-known/jwks.json`,
    }),
    audience: config.jwt.audience,
    issuer: config.jwt.issuer,
    algorithms: ['RS256'],
    cookie: 'monitool_access_token',
});

async function loadProfile(ctx, next) {
    const collection = ctx.io.database.collection('user');
    const subcriber = ctx.state.user.sub;

    // Find or create user
    let user = cache.get(subcriber);
    if (!user) user = await collection.findOne({ subs: subcriber });
    if (!user) user = await createUser(ctx);
    cache.set(subcriber, user);

    // Update lastSeen date if older than 1 minute (no waiting).
    if (new Date() - user.lastSeen > 60 * 1000) {
        user.lastSeen = new Date();
        collection
            .updateOne({ _id: user._id }, { $currentDate: { lastSeen: true } })
            .catch(e => {});
    }

    ctx.state.profile = new Profile(ctx.io, user);

    await next();
}

// E2E test mode: bypass Auth0 JWT verification with a fixed test subject.
// Gated behind config.authDisabled (opt-in, never enabled in production).
const E2E_TEST_PROFILE = {
    email: 'e2e@monitool.test',
    name: 'E2E',
    picture: null,
    email_verified: true,
};

const stubVerify = (ctx, next) => {
    ctx.state.user = { sub: 'e2e|local-tester' };
    return next();
};

export default (ctx, next) =>
    (config.authDisabled ? stubVerify : verifyToken)(ctx, () => loadProfile(ctx, next));
/**
 * Create user is it was not created by a concurrent request
 */
async function createUser(ctx) {
    const subcriber = ctx.state.user.sub;
    const collection = ctx.io.database.collection('user');
    const lock = await ctx.io.redisLock.acquire([`profile:${subcriber}`], 10000);

    try {
        // Search user again, now that we own the lock.
        let user = await collection.findOne({ subs: subcriber });
        if (!user) {
            // User was not found from the subcriber id
            const token =
                ctx.request.header.authorization || ctx.cookies.get('monitool_access_token');
            const profile = config.authDisabled
                ? E2E_TEST_PROFILE
                : await fetchUserInfo(token);
            if (!profile.email) {
                throw new Error(
                    'When loading your profile from your identity provider, we could not find your email address. ' +
                        'Please contact support.'
                );
            }

            if (!profile.email_verified) {
                throw new Error(
                    'Your email address is not verified. ' +
                        'Please verify your email address before accessing monitool. ' +
                        'You should have received an email from us with a link to verify your email address. '
                );
            }

            user = await collection.findOne({ _id: profile.email });
            if (user) {
                // User logged with a new identity provider
                user.subs.push(subcriber);
                collection.updateOne({ _id: user._id }, { $addToSet: { subs: subcriber } });
            } else {
                // User is new: we wait for the insertion before releasing the lock.
                user = {
                    _id: profile.email,
                    name: profile.name,
                    picture: profile.picture,
                    subs: [subcriber],
                    lastSeen: new Date(),
                };

                // insert test project _first_, so that other parallel queries
                // don't find the user, and also get stuck on the shared lock.
                await insertDemoProject(ctx.io, profile.email);

                // One this is done, other queries won't try to get the lock
                // Default retry in redlock is 200ms + 200ms * Math.random()
                await collection.insertOne(user);
            }
        }

        return user;
    } finally {
        // Release the lock (errors are non-fatal; redlock's TTL guards us).
        lock.release().catch(e => {});
    }
}

class Profile {
    constructor(io, user) {
        this.io = io;
        this.email = user._id;
        this.name = user.name;
        this.picture = user.picture;
        this.subs = user.subs;
        this.lastSeen = user.lastSeen;
    }

    async isInvitedTo(projectId) {
        try {
            await getProject(this.io, this.email, projectId, { _id: true });
            return true;
        } catch (e) {
            return false;
        }
    }

    async isOwnerOf(projectId) {
        const numProjects = await this.io.database.collection('project').countDocuments({
            _id: new ObjectId(projectId),
            owner: this.email,
        });

        return 1 === numProjects;
    }
}
