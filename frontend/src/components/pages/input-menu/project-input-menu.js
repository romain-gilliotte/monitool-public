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

	controller: class {

		constructor($state, $stateParams, $rootScope) {
			"ngInject";

			this.$rootScope = $rootScope;
			this.$state = $state;
			this.$stateParams = $stateParams;
		}

		$onChanges() {
			const myEmail = this.$rootScope.profile.email;
			const myInvitation = this.invitations.find(i => i.email === myEmail);

			// A datasource is active if we can perform data entry in at least one site.
			this.activeDataSources = this.project.forms.filter(ds => {
				const mySites = myInvitation ? myInvitation.dataEntry.siteIds : this.project.entities.map(s => s.id);
				const myDss = myInvitation ? myInvitation.dataEntry.dataSourceIds : this.project.forms.map(ds => ds.id);

				return ds.active
					&& ds.elements.some(variable => variable.active)
					&& myDss.includes(ds.id)
					&& ds.entities.some(siteId =>
						this.project.entities.find(site => site.id == siteId).active &&
						mySites.includes(siteId)
					);
			});
		}
	}
});

export default module.name;
