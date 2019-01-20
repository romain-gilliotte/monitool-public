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
import {pipeline} from 'stream';
import JSONStream from 'JSONStream';
import uuidv4 from 'uuid/v4';

import Input from '../resource/model/input';
import Project from '../resource/model/project';

const nullErrorHandler = error => {};

const router = new Router();

router.get('/resources/project', async ctx => {
	let streams = await Project.storeInstance.listByEmail(ctx.state.user.email);
	streams.push(JSONStream.stringify());

	ctx.response.type = 'application/json';
	ctx.response.body = pipeline(...streams, nullErrorHandler);
});

/**
 * Retrieve one project
 */
router.get('/resources/project/:id', async ctx => {
	const project = await Project.storeInstance.get(ctx.params.id);

	ctx.response.body = project.toAPI();
});


/**
 * Retrieve one project
 */
router.get('/resources/project/:id/revisions', async ctx => {
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
		project.users = [{email: ctx.state.user.email, role: "owner"}];
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
		await newProject.save(false, ctx.state.user);

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
	await newProject.save(false, ctx.state.user);

	ctx.response.body = newProject.toAPI();
})


export default router;
