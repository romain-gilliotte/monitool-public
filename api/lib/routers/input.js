/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */


import Router from 'koa-router';
import uuidv4 from 'uuid/v4';

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

	if (q.mode && q.mode.startsWith('ids_by_')) {
		let ids;
		if (q.mode === 'ids_by_form')
			ids = await Input.storeInstance.listIdsByDataSource(q.projectId, q.formId, true);
		else
			throw new Error('invalid_mode');

		ctx.response.body = Object.keys(ids)
			.filter(inputId => ctx.visibleProjectIds.has(inputId.substr(6, 44)))
			.reduce((m, e) => { m[e] = ids[e]; return m; }, {});
	}
	else {
		let inputs;
		if (q.mode === 'current+last')
			inputs = await Input.storeInstance.getLasts(q.projectId, q.formId, q.entityId, q.period, true);
		else
			throw new Error('invalid_mode');

		ctx.response.body = inputs
			.filter(input => ctx.visibleProjectIds.has(input.project))
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
	// Validate that the _id in the payload is the same as the id in the URL.
	if (ctx.request.body._id !== ctx.params.id)
		throw new Error('id_mismatch');

	const input = new Input(ctx.request.body);
	const project = await Project.storeInstance.get(input.project);

	// Check ACLs
	const projectUser = project.getProjectUser(ctx.state.user);
	const projectRole = project.getRole(ctx.state.user);

	const allowed =
		(projectRole === 'owner') ||
		(projectRole === 'input' && projectUser.entities.includes(input.entity) && projectUser.dataSources.includes(input.form));

	if (!allowed)
		throw new Error('forbidden');

	await input.save();
	ctx.response.body = input.toAPI();
})

/**
 * Delete an input.
 */
router.delete('/resources/input/:id', async ctx => {
	const input = await Input.storeInstance.get(ctx.params.id);
	const project = await Project.storeInstance.get(input.project);

	// Check ACLs
	const projectUser = project.getProjectUser(ctx.state.user);
	const projectRole = project.getRole(ctx.state.user);

	const allowed =
		(projectRole === 'owner') ||
		(projectRole === 'input' && projectUser.entities.includes(input.entity) && projectUser.dataSources.includes(input.form));

	if (!allowed)
		throw new Error('forbidden');

	ctx.response.body = input.destroy();
})


export default router;