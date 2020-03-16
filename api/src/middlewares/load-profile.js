const config = require('../config/config');
const AuthenticationClient = require('auth0').AuthenticationClient;
const ObjectId = require('mongodb').ObjectID;

const auth0Client = new AuthenticationClient({
    domain: config.jwt.jwksHost
});

module.exports = async (ctx, next) => {
    const token = ctx.request.header['authorization'].replace(/^Bearer /, '');

    ctx.state.profile = JSON.parse(await redis.get(ctx.state.user.sub));
    if (!ctx.state.profile) {
        ctx.state.profile = await auth0Client.getProfile(token);
        await redis.set(ctx.state.user.sub, JSON.stringify(ctx.state.profile))
    }

    ctx.state.profile.canViewProject = async (projectId) => {
        return 1 === await database.collection('project').countDocuments({
            _id: new ObjectId(projectId),
            $or: [
                { owner: ctx.state.profile.email },
                { 'users.email': ctx.state.profile.email },
            ]
        });
    };

    await next();
};
