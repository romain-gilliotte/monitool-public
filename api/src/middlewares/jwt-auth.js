const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const config = require('../config');
const { findUserByEmail, updateLastSeen } = require('../storage/queries/user');
const Profile = require('../classes/Profile');

module.exports = async (ctx, next) => {
  try {
    // Get token from Authorization header or cookie
    let token = null;

    if (ctx.request.header.authorization) {
      const authHeader = ctx.request.header.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    } else if (ctx.cookies.get('monitool_access_token')) {
      token = ctx.cookies.get('monitool_access_token');
    }

    if (!token) {
      ctx.status = 401;
      ctx.body = { error: 'No token provided' };
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Load user from database
    const user = await findUserByEmail(ctx.io, decoded.email);
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: 'User not found' };
      return;
    }

    if (!user.emailVerified) {
      ctx.status = 401;
      ctx.body = { error: 'Email not verified' };
      return;
    }

    // Update last seen (async, don't wait)
    if (new Date() - new Date(user.lastSeen) > 60 * 1000) {
      updateLastSeen(ctx.io, user._id).catch(logger.error);
    }

    // Create profile object using the Profile class
    ctx.state.profile = new Profile(ctx.io, user);

    await next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token' };
    } else if (error.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = { error: 'Token expired' };
    } else {
      logger.error('JWT Auth Error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
};
