import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import Project from '../../../models/project';

import mtProjectList from '../../shared/project/list';
import mtAclProjectRole from '../../../directives/acl/project-role';

const module = angular.module(
	'monitool.components.pages.project.list',
	[
		uiRouter, // for $stateProvider

		mtProjectList,
		mtAclProjectRole
	]
);


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

	template: require('./list.html'),
});

export default module.name;
