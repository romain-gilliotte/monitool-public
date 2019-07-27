import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import Input from '../../../models/input';

const module = angular.module(
	'monitool.components.pages.project.input.home',
	[
		uiRouter, // for $stateProvider
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project.input.home', {
		acceptedUsers: ['loggedIn'],
		url: '/input-home',
		component: 'projectInputHome',
	});

});


module.component('projectInputHome', {

	bindings: {
		project: '<'
	},

	template: require('./home.html'),

	controller: class ProjectInputHomeController {

		constructor($scope) {
			this.$scope = $scope;
		}

		async $onChanges(changes) {
			this.status = await Input.fetchDataSourceShortStatus(this.project);
			this.$scope.$apply();
		}

	}
});


export default module.name;

