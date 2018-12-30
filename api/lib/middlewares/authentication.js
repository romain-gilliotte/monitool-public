
import jwt from 'jsonwebtoken';


export default async (ctx, next) => {
    const header = ctx.request.header['Authorization'];
    if (header) {
        const token = header.replace(/^Bearer\: /i, '');
        ctx.state.user = jwt.verify(token, config.tokenSecret);
    }
    else
        throw new Error('auth_header_required');

    await next();
};
