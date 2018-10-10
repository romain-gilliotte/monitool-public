

import JSONStream from 'JSONStream';
import Router from 'koa-router';
import {pipeline} from 'stream';
import uuidv4 from 'uuid/v4';

import User from '../resource/model/user';

const nullErrorHandler = error => {console.log(error)};

const router = new Router();

router.get('/resources/user', async ctx => {
	const streams = await User.storeInstance.listForOrganisation(ctx.request.query.organisationId);

	streams.push(JSONStream.stringify());

	ctx.response.type = 'application/json';
	ctx.response.body = pipeline(...streams, nullErrorHandler);
});





export default router;

