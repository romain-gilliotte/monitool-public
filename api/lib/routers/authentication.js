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

import EmailValidator from 'email-deep-validator';
import Router from 'koa-router';

import bcrypt from 'bcrypt';
import owasp from 'owasp-password-strength-test';
import jwt from 'jsonwebtoken'

import {sendValidateEmail, sendResetPassword} from '../mailer/mailer';
import config from '../config/config';
import User from '../resource/model/user';

///////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////

const router = new Router();

/**
 * This handler is POSTed to validate the username and password of partners
 */
router.post(
	'/authentication/login',
	async ctx => {
		const userId = 'user:' + ctx.request.body.email;
		try {
			const user = await User.storeInstance.get(userId);
			const isValid = await bcrypt.compare(ctx.request.body.password, user.passwordHash);
			if (!isValid)
				throw new Error('wrong_password');

			if (user.tokens.validateEmailTokenHash) {
				const e = new Error('need_email_validation');
				e.detail = {sentAt: user.tokens.validateEmailSentAt};
				throw e;
			}

			ctx.response.body = {
				error: null,
				token: jwt.sign({sub: userId, email: user.email}, config.tokenSecret)
			};
		}
		catch (e) {
			ctx.response.status = 403;
			ctx.response.body = {error: e.message, detail: e.detail};
		}
	}
);


/**
 * Register a new account.
 * Need a {email, password} object in the request body
 */
router.post('/authentication/register', async ctx => {
	// Create user & send validation email.
	try {
		if (typeof ctx.request.body.email !== 'string' || typeof ctx.request.body.password !== 'string')
			throw new Error('missing_parameter');

		// Check that the password is secure enough
		// const passwordAssessment = owasp.test(ctx.request.body.password);
		// if (passwordAssessment.errors.length) {
		// 	const error = new Error('password_too_weak');
		// 	error.details = passwordAssessment.errors;
		// 	throw error;
		// }

		// Pre-validate email to avoid typing errors.
		const emailValidator = new EmailValidator();
		const {wellFormed, validDomain, validMailbox} = await emailValidator.verify(ctx.request.body.email);

		if (!wellFormed)
			throw new Error('invalid_email_format');

		if (!validDomain)
			throw new Error('invalid_email_domain');

		if (validMailbox === false)
			throw new Error('invalid_email_mailbox');

		// Create the user.
		const validateEmailToken = Math.random().toString(36).substring(2);
		const newUser = new User({
			_id: 'user:' + ctx.request.body.email,
			email: ctx.request.body.email,
			passwordHash: await bcrypt.hash(ctx.request.body.password, 12),
			createdAt: new Date().toISOString(),
			tokens: {
				validateEmailTokenHash: await bcrypt.hash(validateEmailToken, 12),
				validateEmailSentAt: new Date().toISOString(),
				resetPasswordTokenHash: null,
				resetPasswordEmailSentAt: null
			}
		});

		await newUser.save();

		sendValidateEmail(newUser, validateEmailToken);

		ctx.response.body = {error: false};
	}
	catch (e) {
		console.log(e)
		// This email is already taken.
		if (e.message === 'Document update conflict.') {
			ctx.response.status = 400;
			ctx.response.body = {error: 'account_already_exists'};
		}
		else if (['missing_parameter', 'password_too_weak', 'invalid_email_format', 'invalid_email_domain', 'invalid_email_mailbox'].includes(e.message)) {
			ctx.response.status = 400;
			ctx.response.body = {error: e.message, details: e.details};
		}
		else {
			ctx.response.status = 500;
			ctx.response.body = {error: "server_error"};
		}
	}
});

/**
 * Ask for a password reset email.
 * Expect {email}
 */
router.post('/authentication/request-reset-password', async ctx => {
	try {
		const user = await User.storeInstance.get('user:' + ctx.request.body.email);

		// Maximum is one email every 15 minutes
		if (new Date() - new Date(user.tokens.resetPasswordEmailSentAt) < 15 * 60 * 1000)
			throw new Error('already_sent');

		// FIXME: Cheap random string, not secure at all. Should use crypto.randomBytes().
		const resetToken = Math.random().toString(36).substring(2);
		user.tokens.resetPasswordTokenHash = await bcrypt.hash(resetToken, 12);
		user.tokens.resetPasswordEmailSentAt = new Date().toISOString();
		await user.save();

		sendResetPassword(user, resetToken);

		ctx.response.body = {error: false};
	}
	catch (e) {
		if (['not_found', 'already_sent'].includes(e.message)) {
			ctx.response.status = 400;
			ctx.response.body = {error: e.message};
		}
		else {
			ctx.response.status = 500;
			ctx.response.body = {error: "server_error"};
		}
	}
});


/**
 * Reset the password
 */
router.post('/authentication/reset-password', async ctx => {
	try {
		const user = await User.storeInstance.get('user:' + ctx.request.body.email);

		// Check that the user has requested a reset code.
		if (!user.tokens.resetPasswordTokenHash)
			throw new Error('not_expecting_reset');

		// Check that the password is secure enough.
		const passwordAssessment = owasp.test(ctx.request.body.password);
		if (passwordAssessment.errors.length)
			throw new Error('password_too_weak');

		// Check that the reset code is OK.
		if (!await bcrypt.compare(ctx.request.body.token, user.tokens.resetPasswordTokenHash))
			throw new Error('wrong_code');

		// Reset the user password!
		user.tokens.resetPasswordTokenHash = null;
		user.passwordHash = await bcrypt.hash(ctx.request.body.password, 12);
		user.save();

		ctx.response.body = {error: false};
	}
	catch (e) {
		if (['not_found', 'not_expecting_reset', 'wrong_code'].includes(e.message)) {
			ctx.response.status = 400;
			ctx.response.body = {error: e.message};
		}
		else {
			ctx.response.status = 500;
			ctx.response.body = {error: "server_error"};
		}
	}
});


router.post('/authentication/request-validate-email', async ctx => {
	try {
		const user = await User.storeInstance.get('user:' + ctx.request.body.email);

		// Don't allow double validation.
		if (!user.tokens.validateEmailTokenHash)
			throw new Error('already_validated');

		// Maximum is one email every 15 minutes.
		if (new Date() - new Date(user.tokens.validateEmailSentAt) < 15 * 60 * 1000)
			throw new Error('already_sent');

		// FIXME: Cheap random string, not secure at all. Should use crypto.randomBytes().
		const validateEmailToken = Math.random().toString(36).substring(2);
		user.tokens.validateEmailTokenHash = await bcrypt.hash(validateEmailToken, 12);
		user.tokens.validateEmailSentAt = new Date().toISOString();
		await user.save();

		sendValidateEmail(user, validateEmailToken);

		ctx.response.body = {error: false};
	}
	catch (e) {
		if (['not_found', 'already_validated', 'already_sent'].includes(e.message)) {
			ctx.response.status = 400;
			ctx.response.body = {error: e.message};
		}
		else {
			ctx.response.status = 500;
			ctx.response.body = {error: "server_error"};
		}
	}
});


router.post('/authentication/validate-email', async ctx => {
	try {
		const user = await User.storeInstance.get('user:' + ctx.request.body.email);

		// Don't allow double validation.
		if (!user.tokens.validateEmailTokenHash)
			throw new Error('already_validated');

		if (!await bcrypt.compare(ctx.request.body.token, user.tokens.validateEmailTokenHash))
			throw new Error('wrong_token');

		user.tokens.validateEmailTokenHash = null;
		await user.save();

		ctx.response.body = {error: false};
	}
	catch (e) {
		if (['not_found', 'already_validated', 'wrong_token'].includes(e.message)) {
			ctx.response.status = 400;
			ctx.response.body = {error: e.message};
		}
		else {
			ctx.response.status = 500;
			ctx.response.body = {error: "server_error"};
		}
	}
});


export default router;
