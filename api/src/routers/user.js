const Router = require('@koa/router');

const router = new Router();

// Check authentication status
router.get('/me', async ctx => {
  try {
    // Return user info from the profile set by jwt-auth middleware
    ctx.body = {
      user: {
        email: ctx.state.profile.email,
        name: ctx.state.profile.name,
        picture: ctx.state.profile.picture,
        lastSeen: ctx.state.profile.lastSeen,
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
});

module.exports = router;
