import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import Input from '../../../models/input';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
	$stateProvider.state('project.usage.home', {
		url: '/input-home',
		component: __componentName,
	});
});

module.component(__componentName, {
	bindings: {
		project: '<'
	},
	template: require(__templatePath),
	controller: class ProjectInputHomeController {

		constructor($scope) {
			this.$scope = $scope;
		}

		async $onChanges(changes) {
			this.status = {};

			this.project.forms.forEach(async form => {
				this.status[form.id] = await Input.fetchFormShortStatus(this.project, form.id);
				this.$scope.$apply();
			});
		}
	}
});

export default module.name;

