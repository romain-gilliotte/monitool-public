import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import Input from '../../../models/input';
import axios from 'axios';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
	$stateProvider.state('project.usage.home', {
		url: '/input-home',
		component: __componentName,
		resolve: {
			users: $stateParams =>
				axios
					.get(`/project/${$stateParams.projectId}/user`)
					.then(r => r.data)
		}
	});
});

module.component(__componentName, {
	bindings: {
		project: '<',
		users: '<'
	},
	template: require(__templatePath),
	controller: class ProjectInputHomeController {

		constructor($scope) {
			"ngInject";

			this.$scope = $scope;
		}

		async $onChanges(changes) {
			this.status = {};

			// A datasource is active if we can perform data entry in at least one site.
			this.activeDataSources = this.project.forms.filter(ds => {
				return ds.active
					&& ds.elements.some(variable => variable.active)
					&& ds.entities.some(siteId => this.project.entities.find(site => site.id == siteId).active)
			});

			this.activeDataSources.forEach(async ds => {
				this.status[ds.id] = await Input.fetchFormShortStatus(this.project, ds.id);
				this.$scope.$apply();
			});
		}
	}
});

export default module.name;

