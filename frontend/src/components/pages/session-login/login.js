/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

import angular from 'angular';
import axios from 'axios';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(
	'monitool.components.pages.login',
	[
		uiRouter, // for $stateProvider
	]
);

module.config($stateProvider => {

	$stateProvider.state('init.login', {
		acceptedUsers: ['loggedOut'],
		url: '/login',
		component: 'login'
	});
});


module.component('login', {
	bindings: {
	},
	template: require('./login.html'),
	controller: class LoginController {

		constructor($scope, $rootScope, $state) {
			this.$scope = $scope;
			this.$rootScope = $rootScope;
			this.$state = $state;
		}

		async onLoginClicked() {
			const response = await axios.post('/api/authentication/login', {
				email: this.email,
				password: this.password
			});

			if (response.data.error === null) {
				const token = response.data.token;

				window.localStorage.token = token;
				this.$rootScope.userCtx = JSON.parse(btoa(token.split('.')[1]));
				this.$state.go('main.home')
			}
			else {
				this.errorMessage = response.data.error;
				this.$scope.$apply();
			}
		}
	}
});


export default module.name;
