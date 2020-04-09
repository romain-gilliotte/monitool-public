import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import mtAclProjectInput from '../../../directives/acl/project-input';
import mtAclProjectRole from '../../../directives/acl/project-role';
import mtDisableIf from '../../../directives/helpers/disableif';
import Project from '../../../models/project';

const module = angular.module(__moduleName, [uiRouter, mtAclProjectRole, mtAclProjectInput, mtDisableIf]);

module.config($stateProvider => {

	$stateProvider.state('project', {
		abstract: true,
		url: '/projects/:projectId',
		component: __componentName,

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


module.component(__componentName, {
	bindings: {
		loadedProject: '<'
	},
	transclude: true,
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