/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

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
