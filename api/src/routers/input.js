const Router = require('koa-router');
const ObjectId = require('mongodb').ObjectID;
const Bull = require('bull');

const router = new Router();
const queue = new Bull('reporting');

router.post('/resources/input', async ctx => {
	const { projectId, ...rest } = ctx.request.body;
	const input = {
		projectId: new ObjectId(ctx.request.body.projectId),
		...rest
	};

	await database.collection('input').insertOne(input);

	ctx.response.body = input;
});

router.put('/resources/input/:id', async ctx => {
	const { _id, projectId, ...rest } = ctx.request.body;
	const input = { _id: new ObjectId(_id), projectId: new ObjectId(projectId), ...rest }

	await database.collection('input').replaceOne(
		{ _id: new ObjectId(_id) },
		input
	);

	ctx.response.body = input;
});


router.post('/resources/project/:id/reporting', async ctx => {
	const job = await queue.add('compute-report', {
		projectId: ctx.params.id,
		...ctx.request.body
	});

	ctx.response.type = 'application/json';
	ctx.response.body = JSON.stringify(await job.finished());
});

module.exports = router;
