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
