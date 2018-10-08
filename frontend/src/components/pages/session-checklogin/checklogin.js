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
	'monitool.components.pages.checklogin',
	[
		uiRouter, // for $stateProvider
	]
);

module.config($stateProvider => {

	$stateProvider.state('init.checklogin', {
		acceptedUsers: ['unknown'],
		url: '/checklogin',
		component: 'checklogin'
	});
});


module.component('checklogin', {
	bindings: {
	},
	template: require('./checklogin.html'),
	controller: class CheckLoginController {

		constructor($rootScope, $state) {
			this.$rootScope = $rootScope;
			this.$state = $state;
		}

		async $onInit() {
			const response = await axios.get('/api/authentication/status');
			this.$rootScope.userCtx = response.data;
			this.$state.go('main.home');
		}

	}
})


export default module.name;
