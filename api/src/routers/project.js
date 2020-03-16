const jsonpatch = require('fast-json-patch');
const Router = require('koa-router');
const ObjectId = require('mongodb').ObjectID;
const Project = require('../resource/model/project');
const JSONStream = require('JSONStream');

const router = new Router();

router.get('/resources/project', async ctx => {
	const projects = database.collection('project').find({
		$or: [
			{ owner: ctx.state.profile.email },
			{ 'users.email': ctx.state.profile.email },
		]
	})

	ctx.response.type = 'application/json';
	ctx.response.body = projects.pipe(JSONStream.stringify());
});

/**
 * Retrieve one project
 */
router.get('/resources/project/:id', async ctx => {
	const project = await database.collection('project').findOne({
		_id: new ObjectId(ctx.params.id),
		$or: [
			{ owner: ctx.state.profile.email },
			{ 'users.email': ctx.state.profile.email },
		]
	});

	if (project) {
		ctx.response.body = project;
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

router.post('/resources/project', async ctx => {
	let project;

	if (!ctx.request.query.from) {
		project = ctx.request.body;
		if (project.owner !== ctx.state.profile.email)
			throw new Error('you must own the project');

	} else {
		project = await database.collection('project').findOne(
			{
				_id: new ObjectId(ctx.params.id),
				$or: [
					{ owner: ctx.state.profile.email },
					{ 'users.email': ctx.state.profile.email },
				]
			},
			{ _id: false, users: false }
		);

		project.owner = ctx.state.profile.email;
		project.users = [];
	}

	await database.collection('project').insertOne(project);

	// Recreate all inputs asynchronously. No need to have the user waiting.
	if (ctx.request.query.from && ctx.request.query.with_data == 'true') {
		// clone inputs
		;
	}

	// Give the project to the user.
	ctx.response.body = project;
});

/**
 * Save an existing project
 */
router.put('/resources/project/:id', async ctx => {
	delete ctx.request.body._id;
	Project.validate(ctx.request.body);

	const newProject = ctx.request.body;
	const { value: oldProject } = await database.collection('project').findOneAndReplace(
		{
			_id: new ObjectId(ctx.params.id),
			$or: [
				{ owner: ctx.state.profile.email },
				{
					users: {
						email: ctx.state.profile.email, role: 'owner'
					}
				}
			]
		},
		newProject,
		{ projection: { _id: false } }
	);

	await database.collection('revision').insertOne({
		projectId: new ObjectId(ctx.params.id),
		user: ctx.state.profile.email,
		time: new Date(),
		backwards: jsonpatch.compare(newProject, oldProject),
		forwards: jsonpatch.compare(oldProject, newProject)
	});

	ctx.response.body = { _id: ctx.params.id, ...newProject };
});

module.exports = router;
