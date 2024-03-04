module.exports = async (ctx, next) => {
    if (ctx.params.projectId && (await ctx.state.profile.isInvitedTo(ctx.params.projectId))) {
        await next();
    } else {
        ctx.response.status = 404;
        ctx.response.body = {
            message: 'Resource not found',
        };
    }
};
