const Router = require('koa-router');
const { pipeline } = require('stream');
const JSONStream = require('JSONStream');
const uuidv4 = require('uuid/v4');
const Input = require('../resource/model/input');
const Project = require('../resource/model/project');

const nullErrorHandler = error => { };

const router = new Router();

router.get('/resources/project', async ctx => {
	let streams = await Project.storeInstance.listByEmail(ctx.state.userEmail);
	streams.push(JSONStream.stringify());

	ctx.response.type = 'application/json';
	ctx.response.body = pipeline(...streams, nullErrorHandler);
});

/**
 * Retrieve one project
 */
router.get('/resources/project/:id', async ctx => {
	const project = await Project.storeInstance.get(ctx.params.id);
	if (!project.getUserByEmail(ctx.state.userEmail))
		throw new Error('forbidden');

	ctx.response.body = project.toAPI();
});


/**
 * Retrieve one project
 */
router.get('/resources/project/:id/revisions', async ctx => {
	const project = await Project.storeInstance.get(ctx.params.id);
	if (!project.getUserByEmail(ctx.state.userEmail))
		throw new Error('forbidden');

	ctx.response.body = await Project.storeInstance.listRevisions(
		ctx.params.id,
		ctx.request.query.offset,
		ctx.request.query.limit
	);
});

router.post('/resources/project', async ctx => {
	// User is cloning a project
	if (ctx.request.query.from) {
		// Let fetch the origin project
		const project = await Project.storeInstance.get(ctx.request.query.from);

		// Clone the project
		project._id = 'project:' + uuidv4();
		delete project._rev;
		project.users = [{ email: ctx.state.userEmail, role: "owner" }];
		await project.save();

		// Recreate all inputs asynchronously. No need to have the user waiting.
		if (ctx.request.query.with_data == 'true')
			Input.storeInstance.listByProject(ctx.request.query.from).then(inputs => {
				inputs.forEach(input => {
					input._id = ['input', project._id, input.form, input.entity, input.period].join(':');
					delete input._rev;
					input.project = project._id;
				});

				Input.storeInstance.bulkSave(inputs);
			});

		// Give the project to the user.
		ctx.response.body = project.toAPI();
	}
	// User is creating a project
	else {
		const newProject = new Project(ctx.request.body);
		newProject._id = 'project:' + uuidv4();
		await newProject.save(false, ctx.state.userEmail);

		ctx.response.body = newProject.toAPI();
	}
});

/**
 * Save an existing project
 */
router.put('/resources/project/:id', async ctx => {
	// Validate that the _id in the payload is the same as the id in the URL.
	if (ctx.request.body._id !== ctx.params.id)
		throw new Error('id_mismatch');

	const newProject = new Project(ctx.request.body);
	await newProject.save(false, ctx.state.userEmail);

	ctx.response.body = newProject.toAPI();
})


module.exports = router;
