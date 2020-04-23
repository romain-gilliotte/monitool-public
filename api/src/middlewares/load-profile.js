const { AuthenticationClient } = require('auth0');
const jwksRsa = require('jwks-rsa');
const koaCompose = require('koa-compose');
const koaJwt = require('koa-jwt');
const { ObjectId } = require('mongodb');
const config = require('../config');
const { getProject, insertDemoProject } = require('../storage/queries/project');

const auth0Client = new AuthenticationClient({ domain: config.jwt.jwksHost });

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
        const collection = database.collection('user');
        const subcriber = ctx.state.user.sub;
        const lock = await redisLock.lock(`profile:${subcriber}`, 1000);

        // Find or create user
        let user = await collection.findOne({ subs: subcriber });
        if (!user) {
            // User was not found from the subcriber id
            const token =
                ctx.request.header.authorization || ctx.cookies.get('monitool_access_token');
            const profile = await auth0Client.getProfile(token);

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

                await collection.insertOne(user);
                await insertDemoProject(profile.email);
            }
        }

        // Unlock access to this user (no waiting).
        lock.unlock().catch(e => {});

        // Update lastSeen date if older than 10 minutes (no waiting).
        if (new Date() - user.lastSeen > 10 * 60 * 1000) {
            user.lastSeen = new Date();
            await collection
                .updateOne({ _id: user._id }, { $currentDate: { lastSeen: true } })
                .catch(e => {});
        }

        ctx.state.profile = new Profile(user);

        await next();
    },
]);

class Profile {
    constructor(user) {
        this.email = user._id;
        this.name = user.name;
        this.picture = user.picture;
        this.subs = user.subs;
        this.lastSeen = user.lastSeen;
    }

    async isInvitedTo(projectId) {
        try {
            await getProject(this.email, projectId, { _id: true });
            return true;
        } catch (e) {
            return false;
        }
    }

    async isOwnerOf(projectId) {
        const numProjects = await database.collection('project').countDocuments({
            _id: new ObjectId(projectId),
            owner: this.email,
        });

        return 1 === numProjects;
    }
}
