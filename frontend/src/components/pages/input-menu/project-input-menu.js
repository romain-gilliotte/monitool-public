import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import mtProjectColumns from '../../shared/project/project-columns';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, mtProjectColumns]);

module.config($stateProvider => {

	$stateProvider.state('project.usage', {
		abstract: true,
		component: __componentName,
	});

});


module.component(__componentName, {

	bindings: {
		project: '<',
		invitations: '<'
	},

	template: require(__templatePath),

	controller: class ProjectInputMenuController {

		constructor($state, $stateParams) {
			this.$state = $state;
			this.$stateParams = $stateParams;
		}

		$onChanges() {
			// A datasource is active if we can perform data entry in at least one site.
			this.activeDataSources = this.project.forms.filter(ds => {
				return ds.active
					&& ds.elements.some(variable => variable.active)
					&& ds.entities.some(siteId => this.project.entities.find(site => site.id == siteId).active)
			});
		}
	}
});


export default module.name;

