

import JSONStream from 'JSONStream';
import Router from 'koa-router';
import {pipeline} from 'stream';
import uuidv4 from 'uuid/v4';

import Link from '../resource/model/link';

const nullErrorHandler = error => {console.log(error)};

const router = new Router();

router.get('/resources/link', async ctx => {
	let streams;
	if (ctx.request.query.projectId)
		streams = Link.storeInstance.listForUserProject(ctx.state.user, ctx.request.query.projectId);
	else
		streams = Link.storeInstance.listForUser(ctx.state.user);

	streams.push(JSONStream.stringify());

	ctx.response.type = 'application/json';
	ctx.response.body = pipeline(...streams, nullErrorHandler);
});


router.get('/resources/link/:id', async ctx => {
	const link = await Link.storeInstance.get(ctx.params.id);

	ctx.response.body = link;
});


export default router;

