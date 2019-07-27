
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

	if (q.mode === 'ids_by_form') {
		let ids = await Input.storeInstance.listIdsByDataSource(q.projectId, q.formId, true);

		ctx.response.body = Object.keys(ids)
			// .filter(inputId => ctx.visibleProjectIds.has(inputId.substr(6, 44)))
			.reduce((m, e) => { m[e] = ids[e]; return m; }, {});
	}
	else if (q.mode === 'current+last') {
		let inputs = await Input.storeInstance.getLasts(q.projectId, q.formId, q.entityId, q.period, true);

		ctx.response.body = inputs
			// .filter(input => ctx.visibleProjectIds.has(input.project))
			.map(input => input.toAPI());
	}
});


/**
 * Retrieve one input by id
 */
router.get('/resources/input/:id', async ctx => {
	const input = await Input.storeInstance.get(ctx.params.id);

	// Update the input before sending
	const project = await Project.storeInstance.get(input.project);
	input.update(project.getDataSourceById(input.form).structure);

	// Check if user is allowed (lazy way).
	if (!ctx.visibleProjectIds.has(input.project))
		throw new Error('forbidden');

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

	const user = project.getUserByEmail(ctx.state.user.email);
	if (!user)
		throw new Error('forbidden');

	const allowed =
		(user.role === 'owner') ||
		(user.role === 'input' && user.entities.includes(input.entity) && user.dataSources.includes(input.form));

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
	ctx.response.body = input.destroy();
})


export default router;