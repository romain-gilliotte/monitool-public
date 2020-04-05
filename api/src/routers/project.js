const jiff = require('jiff');
const Router = require('koa-router');
const ObjectId = require('mongodb').ObjectID;
const JSONStream = require('JSONStream');
const validateProject = require('../storage/validator/project');

const router = new Router();

router.get('/resources/project', async ctx => {
	const projects = database.collection('project').find({
		$or: [
			{ owner: ctx.state.profile.email },
			{ 'users.email': ctx.state.profile.email },
		]
	});

	ctx.response.type = 'application/json';
	ctx.response.body = projects.pipe(JSONStream.stringify());
});

/**
 * Retrieve one project
 */
router.get('/resources/project/:id', async ctx => {
	try {
		const project = await database.collection('project').findOne({
			_id: new ObjectId(ctx.params.id),
			$or: [
				{ owner: ctx.state.profile.email },
				{ 'users.email': ctx.state.profile.email },
			]
		});

		if (!project)
			throw new Error('Not found');

		ctx.response.body = project;
	}
	catch (e) {
		if (e.message === 'Not found' || /must be .* 24 hex characters/.test(e.message))
			ctx.response.status = 404;
		else
			throw e;
	}
});


/**
 * Retrieve project revisions
 */
router.get('/resources/project/:id/revisions', async ctx => {
	if (!await ctx.state.profile.canViewProject(ctx.params.id)) {
		ctx.response.status = 404;
		return;
	}
	const revisions = database.collection('revision').find(
		{ projectId: new ObjectId(ctx.params.id) },
		{
			skip: (+ctx.request.query.offset) || 0,
			limit: (+ctx.request.query.limit) || 10,
			sort: [['time', -1]],
			projection: { projectId: false, _id: false },
		}
	);

	ctx.response.type = 'application/json';
	ctx.response.body = revisions.pipe(JSONStream.stringify());
});

/**
 * Create project
 */
router.post('/resources/project', async ctx => {
	const project = ctx.request.body;

	const errors = validateProject(project);
	if (errors.length) {
		ctx.response.status = 400;
		ctx.response.body = errors;
		return;
	}

	if (project.owner !== ctx.state.profile.email) {
		ctx.response.status = 400;
		return;
	}

	await database.collection('project').insertOne(project);
	await database.collection('input_seq').insertOne({ projectIds: [project._id] });

	ctx.response.body = project;
});

/**
 * Save an existing project
 */
router.put('/resources/project/:id', async ctx => {
	const newProject = ctx.request.body;
	delete newProject._id;

	// Check that new project is valid.
	const errors = validateProject(newProject);
	if (errors.length) {
		ctx.response.status = 400;
		ctx.response.body = errors;
		return;
	}

	// Update database and fetch previous version.
	const { value: oldProject } = await database.collection('project').findOneAndReplace(
		{
			_id: new ObjectId(ctx.params.id),
			$or: [
				{ owner: ctx.state.profile.email },
				{ users: { email: ctx.state.profile.email, role: 'owner' } }
			]
		},
		newProject,
		{ projection: { _id: false } }
	);

	if (!oldProject) {
		ctx.response.status = 404;
		return;
	}

	// Insert patch in database.
	await database.collection('revision').insertOne({
		projectId: new ObjectId(ctx.params.id),
		user: ctx.state.profile.email,
		time: new Date(),
		backwards: jiff.diff(
			newProject, oldProject,
			{ invertible: false, makeContext: () => undefined }
		)
	});

	ctx.response.body = { _id: ctx.params.id, ...newProject };
});

module.exports = router;
