const Router = require('koa-router');
const ObjectId = require('mongodb').ObjectID;

const router = new Router();

router.post('/resources/input', async ctx => {
	const { projectId, ...rest } = ctx.request.body;

	if (!await ctx.state.profile.canViewProject(projectId)) {
		ctx.response.status = 403;
		return;
	}

	const sequence = await database.collection('input_seq').findOne(
		{ projectIds: new ObjectId(projectId) },
		{ projection: { _id: true }, sort: [['_id', -1]] }
	);

	const input = { sequenceId: sequence._id, ...rest };
	await database.collection('input').insertOne(input);

	ctx.response.body = input;
});

router.put('/resources/input/:id', async ctx => {
	const { _id, projectId, ...rest } = ctx.request.body;

	// Check that user owns the inputs
	if (!await ctx.state.profile.canViewProject(projectId)) {
		ctx.response.status = 404;
		return;
	}

	const fifteenMinsAgo = new Date(new Date().getTime() - 15 * 60 * 1000);
	const inputDate = new ObjectId(_id).getTimestamp();
	if (inputDate < fifteenMinsAgo) {
		ctx.response.status = 403;
		ctx.response.body = { error: 'This input can no longer be modified.' };
	}

	const input = { _id: new mongoId, projectId: new ObjectId(projectId), ...rest };
	await database.collection('input').replaceOne(
		{ _id: new ObjectId(_id) },
		input
	);

	ctx.response.body = input;
});

module.exports = router;
