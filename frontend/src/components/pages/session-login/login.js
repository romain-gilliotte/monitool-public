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

		constructor($scope) {
			this.$scope = $scope;
		}

		$onInit() {
			this.authenticationMethod = [];
		}

		async onEmailChange() {
			const response = await axios.get('/api/authentication/methods/' + this.email);

			this.accountExists = response.data.accountExists;
			this.methods = response.data.methods;
			this.$scope.$apply();
		}

	}
})


export default module.name;
