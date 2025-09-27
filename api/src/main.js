const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const responseTime = require('koa-response-time');
const session = require('koa-session');
const winston = require('winston');
const config = require('./config');
const { InputOutput } = require('./io');
const passport = require('./middlewares/passport-config');

winston.add(new winston.transports.Console());

// Catch the uncaught errors that weren't wrapped in a domain or try catch statement
process.on('uncaughtException', e => {
  // This should never be called, as we handle all errors insides promises.
  winston.log('error', 'uncaughtException', e);
  process.exit(1);
});

async function start() {
  const app = new Koa();
  app.context.io = new InputOutput();
  await app.context.io.connect();

  // Store IO globally for passport strategies
  global.io = app.context.io;

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
  app.use(require('./middlewares/error-handler'));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Public routes (no authentication required)
  app.use(require('./routers/health').routes());
  app.use(require('./routers/auth').routes());

  // Protected routes (authentication required)
  app.use(require('./middlewares/jwt-auth'));
  app.use(require('./routers/downloads').routes());
  app.use(require('./routers/invitations').routes());
  app.use(require('./routers/input').routes());
  app.use(require('./routers/project').routes());
  app.use(require('./routers/rpc').routes());
  app.use(require('./routers/uploads').routes());

  const server = app.listen(config.port);
  winston.log('info', `Listening on ${config.port}.`);

  const closeFunction = async () => {
    winston.log('info', `Closing gracefully.`);

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
        winston.log('error', 'Error starting application', e);
        process.exit(1);
      });
  }
} else {
  module.exports = { start };
}
