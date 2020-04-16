const { AuthenticationClient } = require('auth0');
const jwksRsa = require('jwks-rsa');
const koaCompose = require('koa-compose');
const koaJwt = require('koa-jwt');
const { ObjectId } = require('mongodb');
const config = require('../config');
const { getProject } = require('../storage/queries');

const auth0Client = new AuthenticationClient({ domain: config.jwt.jwksHost });
const getToken = function (ctx) {
    const token = (ctx.request.header.authorization || ctx.request.query.token);
    return token ? token.replace(/^Bearer /, '') : undefined;
}

module.exports = koaCompose([
    // Validate token
    koaJwt({
        secret: jwksRsa.koaJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 2,
            jwksUri: `https://${config.jwt.jwksHost}/.well-known/jwks.json`
        }),
        audience: config.jwt.audience,
        issuer: config.jwt.issuer,
        algorithms: ['RS256'],
        getToken: getToken
    }),

    // Load profile
    async (ctx, next) => {
        const token = (ctx.request.header.authorization || ctx.request.query.token).replace(/^Bearer /, '');
        const redisKey = `profile:${ctx.state.user.sub}`;

        ctx.state.profile = JSON.parse(await redis.get(redisKey));
        if (!ctx.state.profile) {
            ctx.state.profile = await auth0Client.getProfile(token);

            await redis.set(
                redisKey,
                JSON.stringify(ctx.state.profile),
                'EX',
                60 * 60 * 24
            );
        }

        ctx.state.profile.canViewProject = async projectId => {
            try {
                await getProject(ctx.state.profile.email, projectId, { _id: true })
                return true;
            }
            catch (e) {
                return false;
            }
        };

        ctx.state.profile.ownsProject = async projectId => {
            return 1 === await database.collection('project').countDocuments({
                _id: new ObjectId(projectId),
                owner: ctx.state.profile.email
            });
        };

        await next();
    }
])
