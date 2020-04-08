
module.exports = (validator) => {
    return async (ctx, next) => {
        const errors = validator(ctx.request.body);
        if (errors.length) {
            ctx.response.status = 400;
            ctx.response.body = errors;
        }
        else {
            await next();
        }
    };
};
