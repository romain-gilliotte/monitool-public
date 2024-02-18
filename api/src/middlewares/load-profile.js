const { AuthenticationClient } = require('auth0');
const jwksRsa = require('jwks-rsa');
const koaCompose = require('koa-compose');
const koaJwt = require('koa-jwt');
const Cache = require('lru-cache');
const { ObjectId } = require('mongodb');
const config = require('../config');
const { getProject, insertDemoProject } = require('../storage/queries/project');

const auth0Client = new AuthenticationClient({ domain: config.jwt.jwksHost });
const cache = new Cache({ max: 150, maxAge: 10 * 60 * 1000 });

module.exports = koaCompose([
    // Validate token
    koaJwt({
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
    }),

    // Load profile
    async (ctx, next) => {
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
    },
]);

/**
 * Create user is it was not created by a concurrent request
 */
async function createUser(ctx) {
    const subcriber = ctx.state.user.sub;
    const collection = ctx.io.database.collection('user');
    const lock = await ctx.io.redisLock.lock(`profile:${subcriber}`, 10000);

    try {
        // Search user again, now that we own the lock.
        let user = await collection.findOne({ subs: subcriber });
        if (!user) {
            // User was not found from the subcriber id
            const token =
                ctx.request.header.authorization || ctx.cookies.get('monitool_access_token');
            const profile = await auth0Client.getProfile(token);
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
        // Unlock access to this user (no waiting).
        lock.unlock().catch(e => {});
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
