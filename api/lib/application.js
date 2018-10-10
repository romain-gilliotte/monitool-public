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
import session from 'koa-session'

import config from './config/config';
import passport from 'passport';

import authenticationRouter from './routers/authentication';
import inputRouter from './routers/input';
import pdfRouter from './routers/pdf';
import organisationRouter from './routers/organisation';
import linkRouter from './routers/link';
import projectRouter from './routers/project';
import reportingRouter from './routers/reporting';
import userRouter from './routers/user';

import errorHandler from './middlewares/error-handler';

import checkAuthentication from './middlewares/check-authentication';
import checkEmailValidation from './middlewares/check-email-validation';

const app = new Koa();

app.keys = [config.cookieSecret];

// Generic middlewares
app.use(responseTime()); // Add x-reponse-time header
app.use(errorHandler); // Catch errors and set status codes.

// Enable sessions, body parser, and authentication.
app.use(session({maxAge: 7 * 24 * 3600 * 1000}, app));
app.use(bodyParser({jsonLimit: '1mb'}));
app.use(passport.initialize())
app.use(passport.session())

// Serve authentication related endpoints.
app.use(authenticationRouter.routes()); // login/logout/email validation...

// From now on, all endpoints require authentication and email validation.
app.use(checkAuthentication);
app.use(checkEmailValidation);

// Serve other endpoints.
app.use(organisationRouter.routes());
app.use(inputRouter.routes());
app.use(pdfRouter.routes());
app.use(projectRouter.routes());
app.use(linkRouter.routes());
app.use(reportingRouter.routes());
app.use(userRouter.routes());

export default app;
