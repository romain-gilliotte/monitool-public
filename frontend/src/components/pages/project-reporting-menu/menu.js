import angular from 'angular';
import uiRouter from '@uirouter/angularjs';


const module = angular.module(__moduleName, [uiRouter]);

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

	template: require(__templatePath),

	controller: class ProjectReportingController {


	}
});


export default module.name;

