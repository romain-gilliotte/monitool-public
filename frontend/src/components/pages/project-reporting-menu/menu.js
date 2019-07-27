import angular from 'angular';
import uiRouter from '@uirouter/angularjs';


const module = angular.module(
	'monitool.components.pages.project.reporting.menu',
	[
		uiRouter // for $stateProvider
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project.reporting', {
		abstract: true,
		component: 'projectReportingMenu',
	});

});


module.component('projectReportingMenu', {

	bindings: {
		project: '<'
	},

	template: require('./menu.html'),

	controller: class ProjectReportingController {


	}
});


export default module.name;

