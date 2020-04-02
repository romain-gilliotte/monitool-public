import angular from 'angular';
import Project from '../../../models/project';
import uiRouter from '@uirouter/angularjs';
import mtAclProjectRole from '../../../directives/acl/project-role';
import mtAclProjectInput from '../../../directives/acl/project-input';
import mtDisableIf from '../../../directives/helpers/disableif';

const module = angular.module(__moduleName, [uiRouter, mtAclProjectRole, mtAclProjectInput, mtDisableIf]);

module.config($stateProvider => {

	$stateProvider.state('main.project', {
		abstract: true,
		url: '/projects/:projectId',
		component: 'projectMenu',

		resolve: {
			loadedProject: function ($rootScope, $stateParams, $q) {
				const projectId = $stateParams.projectId;

				return projectId === 'new' ?
					$q.when(new Project({ owner: $rootScope.profile.email })) :
					Project.get(projectId);
			}
		}
	});
});


module.component('projectMenu', {
	bindings: {
		loadedProject: '<'
	},

	template: require(__templatePath),

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
