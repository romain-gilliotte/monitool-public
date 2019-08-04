import aws from 'aws-sdk';
import LruCache from 'lru-cache';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import util from 'util';
import config from '../config/config';

const client = jwksClient({ jwksUri: config.jwt.jwks, cache: true });
const cognito = new aws.CognitoIdentityServiceProvider({})
const verify = util.promisify(jwt.verify.bind(jwt));

const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) callback(err);
        else callback(null, key.publicKey || key.rsaPublicKey);
    });
}

const cache = new LruCache({ max: 500, maxAge: 60 * 60 * 1000 })

export default async (ctx, next) => {
    const authorization = ctx.request.header['authorization'];

    try {
        // Check token.
        const token = await verify(authorization, getKey);

        // Load profile from cognito
        ctx.state.userEmail = cache.get(token.sub);
        if (!ctx.state.userEmail) {
            const result = await cognito.getUser({ AccessToken: authorization }).promise();
            const email = result.UserAttributes.find(attr => attr.Name === 'email').Value;

            cache.set(token.sub, email);
            ctx.state.userEmail = email;
        }
    }
    catch (e) {
        ctx.response.status = 401;
        ctx.response.body = { error: 'invalid_token' };
        return;
    }

    await next();
};
