const Router = require('@koa/router');
const passport = require('../middlewares/passport-config');
const emailService = require('../utils/email-service');
const winston = require('winston');
const {
  createUser,
  findUserByEmail,
  verifyEmail,
  setPasswordResetToken,
  resetPassword,
  updateLastSeen,
} = require('../storage/queries/user');
const jwt = require('jsonwebtoken');
const config = require('../config');

const router = new Router();

// Register endpoint
router.post('/register', async ctx => {
  const { email, password, name } = ctx.request.body;

  if (!email || !password || !name) {
    ctx.status = 400;
    ctx.body = { error: 'Email, password, and name are required' };
    return;
  }

  if (password.length < 8) {
    ctx.status = 400;
    ctx.body = { error: 'Password must be at least 8 characters long' };
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(ctx.io, email);
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { error: 'User already exists with this email' };
      return;
    }

    // Create user
    const user = await createUser(ctx.io, { email, password, name });

    // Try to send verification email, but don't fail registration if email fails
    let emailSent = false;
    try {
      await emailService.sendVerificationEmail(email, name, user.emailVerificationToken);
      emailSent = true;
    } catch (emailError) {
      winston.warn('Failed to send verification email:', emailError.message);
      // In development, this is expected if AWS credentials are not configured
    }

    ctx.status = 201;
    ctx.body = {
      message: emailSent
        ? 'Registration successful. Please check your email to verify your account.'
        : 'Registration successful. Email verification is disabled in development mode.',
      emailSent,
    };
  } catch (error) {
    winston.error('Registration error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

// Login endpoint
router.post('/login', async (ctx, next) => {
  return passport.authenticate('local', (err, user, info) => {
    if (err) {
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
      return;
    }

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        error: info?.message || 'Authentication failed',
        isAuth0User: info?.isAuth0User || false,
      };
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ email: user._id, name: user.name }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn || '7d',
    });

    // Update last seen
    updateLastSeen(ctx.io, user._id).catch(winston.error);

    ctx.body = {
      token,
      user: {
        email: user._id,
        name: user.name,
        picture: user.picture,
      },
    };
  })(ctx, next);
});

// Logout endpoint
router.post('/logout', ctx => {
  ctx.logout();
  ctx.body = { message: 'Logged out successfully' };
});

// Email verification endpoint
router.get('/verify-email', async ctx => {
  const { token } = ctx.query;

  if (!token) {
    ctx.status = 400;
    ctx.body = { error: 'Verification token is required' };
    return;
  }

  try {
    const success = await verifyEmail(ctx.io, token);
    if (success) {
      ctx.body = { message: 'Email verified successfully' };
    } else {
      ctx.status = 400;
      ctx.body = { error: 'Invalid or expired verification token' };
    }
  } catch (error) {
    winston.error('Email verification error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

// Forgot password endpoint
router.post('/forgot-password', async ctx => {
  const { email } = ctx.request.body;

  if (!email) {
    ctx.status = 400;
    ctx.body = { error: 'Email is required' };
    return;
  }

  try {
    const user = await findUserByEmail(ctx.io, email);
    if (!user) {
      // Don't reveal if email exists
      ctx.body = {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
      return;
    }

    const resetToken = await setPasswordResetToken(ctx.io, email);

    try {
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);

      ctx.body = {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    } catch (emailError) {
      ctx.status = 500;
      ctx.body = {
        error: 'Failed to send password reset email. Please try again later.',
      };
    }
  } catch (error) {
    winston.error('Forgot password error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

// Reset password endpoint
router.post('/reset-password', async ctx => {
  const { token, password } = ctx.request.body;

  if (!token || !password) {
    ctx.status = 400;
    ctx.body = { error: 'Token and new password are required' };
    return;
  }

  if (password.length < 8) {
    ctx.status = 400;
    ctx.body = { error: 'Password must be at least 8 characters long' };
    return;
  }

  try {
    const success = await resetPassword(ctx.io, token, password);
    if (success) {
      ctx.body = { message: 'Password reset successfully' };
    } else {
      ctx.status = 400;
      ctx.body = { error: 'Invalid or expired reset token' };
    }
  } catch (error) {
    winston.error('Password reset error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

// Google OAuth routes
router.get('/google', async (ctx, next) => {
  if (!config.oauth.google.clientId) {
    ctx.status = 500;
    ctx.body = { error: 'Google OAuth provider not configured' };
    return;
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(ctx, next);
});

router.get('/google/callback', async (ctx, next) => {
  if (!config.oauth.google.clientId) {
    ctx.status = 500;
    ctx.body = { error: 'Google OAuth provider not configured' };
    return;
  }

  return passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' })(
    ctx,
    async () => {
      // Generate JWT token
      const token = jwt.sign(
        { email: ctx.state.user._id, name: ctx.state.user.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn || '7d' }
      );

      // Update last seen
      updateLastSeen(ctx.io, ctx.state.user._id).catch(winston.error);

      // Redirect to frontend with token
      ctx.redirect(`${config.appUrl}/app.html#!/oauth-callback?token=${token}`);
    }
  );
});

// Microsoft OAuth routes
router.get('/microsoft', async (ctx, next) => {
  if (!config.oauth.microsoft.clientId) {
    ctx.status = 500;
    ctx.body = { error: 'Microsoft OAuth provider not configured' };
    return;
  }
  return passport.authenticate('microsoft', { scope: ['user.read'] })(ctx, next);
});

router.get('/microsoft/callback', async (ctx, next) => {
  if (!config.oauth.microsoft.clientId) {
    ctx.status = 500;
    ctx.body = { error: 'Microsoft OAuth provider not configured' };
    return;
  }

  return passport.authenticate('microsoft', { failureRedirect: '/login?error=oauth_failed' })(
    ctx,
    async () => {
      // Generate JWT token
      const token = jwt.sign(
        { email: ctx.state.user._id, name: ctx.state.user.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn || '7d' }
      );

      // Update last seen
      updateLastSeen(ctx.io, ctx.state.user._id).catch(winston.error);

      // Redirect to frontend with token
      ctx.redirect(`${config.appUrl}/app.html#!/oauth-callback?token=${token}`);
    }
  );
});

// OAuth configuration endpoint (public)
router.get('/oauth-config', ctx => {
  ctx.body = {
    google: {
      enabled: !!config.oauth.google.clientId,
      configured: !!config.oauth.google.clientId && !!config.oauth.google.clientSecret,
    },
    microsoft: {
      enabled: !!config.oauth.microsoft.clientId,
      configured: !!config.oauth.microsoft.clientId && !!config.oauth.microsoft.clientSecret,
    },
  };
});

// Check authentication status
router.get('/me', async ctx => {
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
      ctx.body = { error: 'Not authenticated' };
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

    ctx.body = {
      user: {
        email: user._id,
        name: user.name,
        picture: user.picture,
      },
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      ctx.status = 401;
      ctx.body = { error: 'Invalid token' };
    } else if (error.name === 'TokenExpiredError') {
      ctx.status = 401;
      ctx.body = { error: 'Token expired' };
    } else {
      winston.error('Auth check error:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  }
});

module.exports = router;
