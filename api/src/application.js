const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const responseTime = require('koa-response-time');
const cors = require('@koa/cors');
const authenticationMiddleware = require('./middlewares/authentication');
const inputRouter = require('./routers/input');
const pdf1Router = require('./routers/pdf-datasource');
const pdf2Router = require('./routers/pdf-logframe');
const projectRouter = require('./routers/project');
const errorHandler = require('./middlewares/error-handler');

const app = new Koa();

// Generic middlewares
app.use(cors());
app.use(responseTime()); // Add x-reponse-time header
app.use(bodyParser({ jsonLimit: '1mb' }));

app.use(errorHandler); // Catch errors and set status codes.
app.use(authenticationMiddleware);
app.use(require('./middlewares/load-profile'));

// Serve authentication related endpoints.
app.use(inputRouter.routes());
app.use(pdf1Router.routes());
app.use(pdf2Router.routes());
app.use(projectRouter.routes());

module.exports = app;
