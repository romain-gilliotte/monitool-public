const jwt = require('jsonwebtoken');
const winston = require('winston');
const config = require('../config');
const { findUserByEmail, updateLastSeen } = require('../storage/queries/user');

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
      updateLastSeen(ctx.io, user._id).catch(winston.error);
    }

    // Create profile object similar to the original structure
    ctx.state.profile = {
      io: ctx.io,
      email: user._id,
      name: user.name,
      picture: user.picture,
      lastSeen: user.lastSeen,

      // Methods from original Profile class
      async isInvitedTo(projectId) {
        try {
          const { getProject } = require('../storage/queries/project');
          await getProject(this.io, this.email, projectId, { _id: true });
          return true;
        } catch (e) {
          return false;
        }
      },

      async isOwnerOf(projectId) {
        const { ObjectId } = require('mongodb');
        const numProjects = await this.io.database.collection('project').countDocuments({
          _id: new ObjectId(projectId),
          owner: this.email,
        });
        return numProjects === 1;
      },
    };

    await next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token' };
    } else if (error.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = { error: 'Token expired' };
    } else {
      winston.error('JWT Auth Error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
};
