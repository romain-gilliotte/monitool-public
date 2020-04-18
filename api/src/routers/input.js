const Router = require('@koa/router');
const ObjectId = require('mongodb').ObjectID;
const { deleteFiles } = require('../storage/gridfs');
const validateBody = require('../middlewares/validate-body');

const validator = validateBody(require('../storage/validator/input'));

const router = new Router();

router.post('/input', validator, async ctx => {
	const { projectId, content } = ctx.request.body;
	if (!await ctx.state.profile.canViewProject(projectId)) {
		ctx.response.status = 403;
		return;
	}

	// Save input on last sequence of the project.
	const sequence = await database.collection('input_seq').findOne(
		{ projectIds: new ObjectId(projectId) },
		{ projection: { _id: true }, sort: [['_id', -1]] }
	);

	const input = {
		sequenceId: sequence._id,
		content: content.map(c => ({
			variableId: c.variableId,
			dimensions: c.dimensions,
			data: c.data.map(d => typeof d === 'number' ? d : NaN) // cast null to NaN
		}))
	};

	await database.collection('input').insertOne(input);

	// Clear reporting cache
	await Promise.all([
		redis.del(`reporting:${projectId}`),
		deleteFiles(`reporting:${projectId}`)
	]);

	delete input._id;
	delete input.sequenceId;

	ctx.response.body = input;
});

module.exports = router;
