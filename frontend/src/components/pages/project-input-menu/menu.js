import angular from 'angular';
import uiRouter from '@uirouter/angularjs';


const module = angular.module(
	'monitool.components.pages.project.input.menu',
	[
		uiRouter // for $stateProvider
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project.input', {
		abstract: true,
		component: 'projectInputMenu',
	});

});


module.component('projectInputMenu', {

	bindings: {
		project: '<'
	},

	template: require('./menu.html'),

	controller: class ProjectInputMenuController {

		constructor($state, $stateParams) {
			this.$state = $state;
			this.$stateParams = $stateParams;
		}
	}
});


export default module.name;

