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
import uiRouter from '@uirouter/angularjs';

import Organisation from '../../../models/organisation';

const module = angular.module(
	'monitool.components.pages.organisation.list',
	[
		uiRouter, // for $stateProvider
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.organisations', {
		acceptedUsers: ['loggedIn'],
		url: '/organisations',
		component: 'organisationList',
		resolve: {
			organisations: () => Organisation.fetchAll()
		}
	});

});


module.component('organisationList', {

	bindings: {
		organisations: "<"
	},

	template: require('./list.html'),

	controller: class OrganisationListController {

	}
});


export default module.name;

