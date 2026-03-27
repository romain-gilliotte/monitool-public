const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const responseTime = require('koa-response-time');
const session = require('koa-session');
const logger = require('./utils/logger');
const config = require('./config');
const { InputOutput } = require('./io');
const { passport, configurePassport } = require('./middlewares/passport-config');
const errorHandler = require('./middlewares/error-handler');
const healthRouter = require('./routers/health');
const authRouter = require('./routers/auth');
const jwtAuth = require('./middlewares/jwt-auth');
const userRouter = require('./routers/user');
const downloadsRouter = require('./routers/downloads');
const invitationsRouter = require('./routers/invitations');
const inputRouter = require('./routers/input');
const projectRouter = require('./routers/project');
const rpcRouter = require('./routers/rpc');
const uploadsRouter = require('./routers/uploads');

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', e => {
  // This should never be called, as we handle all errors insides promises.
  logger.error('uncaughtException', e);
  process.exit(1);
});

async function start() {
  const app = new Koa();
  app.context.io = new InputOutput();
  await app.context.io.connect();

  // Configure Passport with IO
  configurePassport(app.context.io);

  // Session configuration
  app.keys = [config.session.secret || 'your-session-secret'];
  app.use(
    session(
      {
        key: 'monitool:sess',
        maxAge: 86400000, // 24 hours
        overwrite: true,
        httpOnly: true,
        signed: true,
        rolling: false,
        renew: false,
      },
      app
    )
  );

  app.use(cors({ credentials: true, origin: config.appUrl }));
  app.use(responseTime());
  app.use(bodyParser({ enableTypes: ['json'] }));
  app.use(errorHandler);

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Public routes (no authentication required)
  app.use(healthRouter.routes());
  app.use(authRouter.routes());

  // Protected routes (authentication required)
  app.use(jwtAuth);
  app.use(userRouter.routes());
  app.use(downloadsRouter.routes());
  app.use(invitationsRouter.routes());
  app.use(inputRouter.routes());
  app.use(projectRouter.routes());
  app.use(rpcRouter.routes());
  app.use(uploadsRouter.routes());

  const server = app.listen(config.port);
  logger.info(`Listening on ${config.port}.`);

  const closeFunction = async () => {
    logger.info(`Closing gracefully.`);

    server.close(); // should listen to the event handler
    await app.context.io.disconnect();
    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  };

  // Return both the close function and server for testing
  closeFunction.server = server;
  return closeFunction;
}

if (require.main === module) {
  // This file was executed: Start application.
  if (config.cluster && cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  } else {
    start()
      .then(stop => {
        process.on('SIGINT', stop);
      })
      .catch(e => {
        logger.error('Error starting application', e);
        process.exit(1);
      });
  }
} else {
  module.exports = { start };
}
