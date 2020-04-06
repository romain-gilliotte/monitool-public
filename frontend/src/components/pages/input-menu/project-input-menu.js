import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import mtProjectColumns from '../../shared/project/project-columns';

const module = angular.module(__moduleName, [uiRouter, mtProjectColumns]);

module.config($stateProvider => {

	$stateProvider.state('project.input', {
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

