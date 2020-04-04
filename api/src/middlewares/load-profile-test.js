
/**
 * This middleware is used only to run the test suite.
 * It is loaded when NODE_ENV=test
 */
module.exports = async (ctx, next) => {
    if (ctx.request.header['email']) {
        ctx.state.profile = { email: ctx.request.header['email'] };
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
    }
    else {
        ctx.response.status = 403;
    }
};
