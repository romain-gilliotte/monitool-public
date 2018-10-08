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

import angular from 'angular';

import Project from '../../../models/project';

import uiRouter from '@uirouter/angularjs';

import mtDirectiveAclProjectRole from '../../../directives/acl/project-role';
import mtDirectiveAclProjectInput from '../../../directives/acl/project-input';
import mtDirectiveDisableIf from '../../../directives/helpers/disableif';


const module = angular.module(
	'monitool.components.pages.project.menu',
	[
		uiRouter, // for $stateProvider

		mtDirectiveAclProjectRole,
		mtDirectiveAclProjectInput,
		mtDirectiveDisableIf
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project', {
		abstract: true,
		url: '/projects/:projectId',
		component: 'projectMenu',

		resolve: {
			loadedProject: function($rootScope, $stateParams, $q) {
				const projectId = $stateParams.projectId;

				if (projectId === 'new') {
					const project = new Project();
					project.users.push({email: $rootScope.userCtx.email, role: "owner"});
					return $q.when(project);
				}
				else
					return Project.get(projectId);
			}
		}
	});
});


module.component('projectMenu', {
	bindings: {
		loadedProject: '<'
	},

	template: require('./menu.html'),

	controller: class ProjectMenuController {

		$onChanges(changes) {
			this.project = this.loadedProject;
		}

		onProjectSaveSuccess(newProject) {
			this.project = newProject;
		}

	}

});


export default module.name;
