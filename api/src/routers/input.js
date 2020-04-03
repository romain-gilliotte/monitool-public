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

router.post('/rpc/build-report', async ctx => {
	const job = await queue.add('compute-report', ctx.request.body);

	ctx.response.type = 'application/json';
	ctx.response.body = JSON.stringify(await job.finished());
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
