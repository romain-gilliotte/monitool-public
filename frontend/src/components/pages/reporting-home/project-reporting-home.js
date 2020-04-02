import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {

	$stateProvider.state('main.project.reporting.home', {
		url: '/reporting-home',
		component: __componentName,
	});

});


module.component(__componentName, {
	bindings: {
		project: '<'
	},
	template: require(__templatePath),
});

module.component('projectReportingHomeEn', {
	template: require('./home-en.html'),
});

module.component('projectReportingHomeEs', {
	template: require('./home-es.html'),
});

module.component('projectReportingHomeFr', {
	template: require('./home-fr.html'),
});


export default module.name;

