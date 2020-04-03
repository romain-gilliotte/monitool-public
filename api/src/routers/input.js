const Router = require('koa-router');
const ObjectId = require('mongodb').ObjectID;

const router = new Router();

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

	// Check that user owns the inputs
	if (!await ctx.profile.canViewProject(projectId)) {
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

router.post('/rpc/build-report', async ctx => {
	const projectId = ctx.request.body.projectId;

	if (await ctx.state.profile.canViewProject(projectId)) {
		const job = await queue.add('compute-report', ctx.request.body);

		ctx.response.type = 'application/json';
		ctx.response.body = JSON.stringify(await job.finished());
	}
	else {
		ctx.response.status = 403;
	}
});

/** Get the data of the last data entry for all projects */
router.get('/rpc/get-last-inputs', async ctx => {
	// We expect this to be faster than using $lookup, even with the added round trip.
	const projects = await database.collection('project').find(
		{ $or: [{ owner: ctx.state.profile.email }, { 'users.email': ctx.state.profile.email }] },
		{ projection: { _id: true } }
	).toArray();

	ctx.response.body = await database
		.collection('input')
		.aggregate([
			{ $match: { projectId: { $in: projects.map(p => new ObjectId(p._id)) } } },
			{ $group: { _id: '$projectId', lastEntry: { $first: '$_id' } } },
			{ $project: { value: [{ $toString: '$_id' }, { $toDate: '$lastEntry' }] } },
			{ $group: { _id: null, value: { $push: '$value' } } },
			{ $project: { value: { $arrayToObject: '$value' } } },
			{ $replaceRoot: { newRoot: '$value' } }
		])
		.next();
});

module.exports = router;
