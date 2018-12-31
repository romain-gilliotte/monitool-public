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
			try {
				this.errorMessage = null;

				if (this.isWaitingToken && this.token) {
					await axios.post('/api/authentication/validate-email', {
						email: this.email,
						token: this.token
					});
				}

				const response = await axios.post('/api/authentication/login', {
					email: this.email,
					password: this.password
				});

				window.localStorage.token = response.data.token;

				// Setup default axios header.
				axios.defaults.headers.common['Authorization'] = window.localStorage.token;

				// Put user in $rootScope
				const payload = atob(window.localStorage.token.split('.')[1]);
				this.$rootScope.userCtx = JSON.parse(payload);

				this.$state.go('main.home')
			}
			catch (e) {
				if (e.response.data.error == 'need_email_validation') {
					this.isWaitingToken = true;
					this.validationSentAt = e.response.data.detail.sentAt;
				}
				else
					this.errorMessage = e.response.data.error;

				this.$scope.$apply();
			}
		}
	}
});


export default module.name;
