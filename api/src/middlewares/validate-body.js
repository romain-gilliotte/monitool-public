const Ajv = require('ajv');

module.exports = (name) => {
    let schemaFn = new Ajv().compile(require(`../storage/schema/${name}`));
    let customFn;
    try { customFn = require(`../storage/validator/${name}`); }
    catch (e) { }

    return async (ctx, next) => {
        const schemaPassed = schemaFn(ctx.request.body);
        if (!schemaPassed) {
            ctx.response.status = 400;
            ctx.response.body = formatAjvErrors(schemaFn.errors);
            return;
        }

        if (customFn) {
            const errors = customFn(ctx.request.body);
            if (errors.length) {
                ctx.response.status = 400;
                ctx.response.body = errors;
                return;
            }
        }

        await next();
    };
};

function formatAjvErrors(errors) {
    return errors.map(error => {
        let path = error.dataPath;
        if (error.keyword === 'additionalProperties')
            path += `.${error.params.additionalProperty}`;

        return { path: path, code: error.keyword, message: error.message };
    });
}
