

import JSONStream from 'JSONStream';
import Router from 'koa-router';
import {pipeline} from 'stream';
import uuidv4 from 'uuid/v4';

import Organisation from '../resource/model/organisation';

const nullErrorHandler = error => {console.log(error)};

const router = new Router();

router.get('/resources/organisation', async ctx => {
	const streams = Organisation.storeInstance.listForUser(ctx.state.user);

	streams.push(JSONStream.stringify());

	ctx.response.type = 'application/json';
	ctx.response.body = pipeline(...streams, nullErrorHandler);
});


router.get('/resources/organisation/:id', async ctx => {
	const organisation = await Organisation.storeInstance.get(ctx.params.id);

	ctx.response.body = organisation;
});



export default router;

