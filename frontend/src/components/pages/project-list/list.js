import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import Project from '../../../models/project';
import mtProjectList from '../../shared/project/list';
import mtAclProjectRole from '../../../directives/acl/project-role';

const module = angular.module(__moduleName, [uiRouter, mtProjectList, mtAclProjectRole]);

module.config($stateProvider => {
	$stateProvider.state('main.projects', {
		acceptedUsers: ['loggedIn'],
		url: '/projects',
		component: 'projectListPage',
		resolve: {
			projects: ($rootScope) => Project.fetchAll()
		}
	});

});


module.component('projectListPage', {
	bindings: {
		'projects': '<'
	},

	template: require(__templatePath),
});

export default module.name;
