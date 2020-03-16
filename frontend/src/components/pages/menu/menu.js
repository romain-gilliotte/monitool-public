import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import uiDropdown from 'angular-ui-bootstrap/src/dropdown/index';
import uiCollapse from 'angular-ui-bootstrap/src/collapse/index';

const module = angular.module(
	'monitool.components.pages.menu',
	[
		uiRouter, // for $stateProvider
		uiDropdown,
		uiCollapse
	]
);


module.config($stateProvider => {
	$stateProvider.state('main', {
		abstract: true,
		component: 'topMenu'
	});

});


module.component('topMenu', {
	template: require('./menu.html'),
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
})

export default module.name;
