import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import uiDropdown from 'angular-ui-bootstrap/src/dropdown';
import uiCollapse from 'angular-ui-bootstrap/src/collapse';

const module = angular.module(__moduleName, [uiRouter, uiDropdown, uiCollapse]);

module.config($stateProvider => {
	$stateProvider.state('main', {
		abstract: true,
		component: __componentName
	});
});

module.component(__componentName, {
	template: require(__templatePath),
	controller: class MenuController {

		constructor($state, $rootScope) {
			this.$state = $state;
			this.$rootScope = $rootScope
		}

		logout() {
			window.auth0.logout({
				returnTo: window.location.origin
			});
		}
	}
});

export default module.name;
