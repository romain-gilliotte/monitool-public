import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import responseTime from 'koa-response-time';

import config from './config/config';

import authenticationMiddleware from './middlewares/authentication';

import authenticationRouter from './routers/authentication';
import inputRouter from './routers/input';
import pdfRouter from './routers/pdf';
import projectRouter from './routers/project';
import reportingRouter from './routers/reporting';

import errorHandler from './middlewares/error-handler';

const app = new Koa();

app.keys = [config.cookieSecret];

// Generic middlewares
app.use(responseTime()); // Add x-reponse-time header
app.use(bodyParser({jsonLimit: '1mb'}));

app.use(errorHandler); // Catch errors and set status codes.
app.use(authenticationRouter.routes()); // login/logout/email validation...

app.use(authenticationMiddleware);

// Serve authentication related endpoints.
app.use(inputRouter.routes());
app.use(pdfRouter.routes());
app.use(projectRouter.routes());
app.use(reportingRouter.routes());

export default app;
