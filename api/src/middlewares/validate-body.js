import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import formatAjvErrors from '../utils/format-ajv-errors.js';
import inputSchema from '../storage/schema/input.js';
import invitationSchema from '../storage/schema/invitation.js';
import projectSchema from '../storage/schema/project.js';
import inputValidator from '../storage/validator/input.js';
import projectValidator from '../storage/validator/project.js';

const schemas = {
    input: inputSchema,
    invitation: invitationSchema,
    project: projectSchema,
};

const customValidators = {
    input: inputValidator,
    project: projectValidator,
};

export default name => {
    const ajv = new Ajv();
    addFormats(ajv);

    const schemaFn = ajv.compile(schemas[name]);
    const customFn = customValidators[name] ?? (() => []);

    return async (ctx, next) => {
        const schemaPassed = schemaFn(ctx.request.body);
        if (!schemaPassed) {
            ctx.response.status = 400;
            ctx.response.body = formatAjvErrors(schemaFn.errors);
            return;
        }

        const errors = customFn(ctx.request.body);
        if (errors.length) {
            ctx.response.status = 400;
            ctx.response.body = errors;
            return;
        }

        await next();
    };
};
