const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const responseTime = require('koa-response-time');
const cors = require('@koa/cors');
const authenticationMiddleware = require('./middlewares/authentication');
const inputRouter = require('./routers/input');
const pdfRouter = require('./routers/pdf');
const projectRouter = require('./routers/project');
const reportingRouter = require('./routers/reporting');
const errorHandler = require('./middlewares/error-handler');

const app = new Koa();

// Generic middlewares
app.use(cors());
app.use(responseTime()); // Add x-reponse-time header
app.use(bodyParser({ jsonLimit: '1mb' }));

app.use(errorHandler); // Catch errors and set status codes.
app.use(authenticationMiddleware);

// Serve authentication related endpoints.
app.use(inputRouter.routes());
app.use(pdfRouter.routes());
app.use(projectRouter.routes());
app.use(reportingRouter.routes());

module.exports = app;
