import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {

	$stateProvider.state('main.project.input', {
		abstract: true,
		component: __componentName,
	});

});


module.component(__componentName, {

	bindings: {
		project: '<'
	},

	template: require(__templatePath),

	controller: class ProjectInputMenuController {

		constructor($state, $stateParams) {
			this.$state = $state;
			this.$stateParams = $stateParams;
		}
	}
});


export default module.name;

