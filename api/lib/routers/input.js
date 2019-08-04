
import Router from 'koa-router';
import uuidv4 from 'uuid/v4';

import Project from '../resource/model/project';
import Input from '../resource/model/input';

const router = new Router();

/**
 * Retrieve a list of inputs, or inputs ids.
 *
 * Multiple modes are supported
 * 		- ids_by_form: retrieve all input ids that match a given projectId and formId
 * 		- current+last: retrieve a given input and the previous one (with projectId, formId, entityId & period)
 */
router.get('/resources/input', async ctx => {
	const q = ctx.request.query;

	if (!await Project.storeInstance.canView(ctx.state.userEmail, q.projectId))
		throw new Error('forbidden');

	if (q.mode === 'ids_by_form') {
		let ids = await Input.storeInstance.listIdsByDataSource(q.projectId, q.formId, true);

		ctx.response.body = Object.keys(ids).reduce((m, e) => { m[e] = ids[e]; return m; }, {});
	}
	else if (q.mode === 'current+last') {
		let inputs = await Input.storeInstance.getLasts(q.projectId, q.formId, q.entityId, q.period, true);

		ctx.response.body = inputs.map(input => input.toAPI());
	}
});


/**
 * Retrieve one input by id
 */
router.get('/resources/input/:id', async ctx => {
	if (!await Project.storeInstance.canView(ctx.state.userEmail, ctx.params.id.substring(6, 46)))
		throw new Error('forbidden');

	const [project, input] = await Promise.all([
		Project.storeInstance.get(`project:${ctx.params.id.substring(6, 46)}`),
		Input.storeInstance.get(ctx.params.id)
	]);

	input.update(project.getDataSourceById(input.form).structure);
	ctx.response.body = input.toAPI();
});


/**
 * Save an input
 */
router.put('/resources/input/:id', async ctx => {
	const input = new Input(ctx.request.body);

	// Validate that the _id in the payload is the same as the id in the URL.
	if (input._id !== ctx.params.id)
		throw new Error('id_mismatch');

	// Validate that the user is allowed to change this input.
	const project = await Project.storeInstance.get(input.project);
	const user = project.getUserByEmail(ctx.state.userEmail);
	const allowed = user && (
		(user.role === 'owner') ||
		(user.role === 'input' && user.entities.includes(input.entity) && user.dataSources.includes(input.form))
	);
	if (!allowed)
		throw new Error('forbidden');

	await input.save();
	ctx.response.body = input.toAPI();
});

/**
 * Delete an input.
 */
router.delete('/resources/input/:id', async ctx => {
	const input = await Input.storeInstance.get(ctx.params.id);

	// Validate that the user is allowed to change this input.
	const project = await Project.storeInstance.get(input.project);
	const user = project.getUserByEmail(ctx.state.userEmail);
	const allowed = user && (
		(user.role === 'owner') ||
		(user.role === 'input' && user.entities.includes(input.entity) && user.dataSources.includes(input.form))
	);
	if (!allowed)
		throw new Error('forbidden');

	ctx.response.body = input.destroy();
})


export default router;