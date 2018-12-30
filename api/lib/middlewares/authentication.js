
import jwt from 'jsonwebtoken';
import config from '../config/config';

export default async (ctx, next) => {
    const header = ctx.request.header['authorization'];
    if (header) {
        const token = header.replace(/^Bearer\: /i, '');
        ctx.state.user = jwt.verify(token, config.tokenSecret);
    }
    else
        throw new Error('auth_header_required');

    await next();
};
