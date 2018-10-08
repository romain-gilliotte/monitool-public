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
	'monitool.components.pages.organisation.menu',
	[
		uiRouter, // for $stateProvider
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.organisation', {
		abstract: true,
		acceptedUsers: ['loggedIn'],
		url: '/organisation/:organisationId',
		component: 'organisationMenu',

		resolve: {
			loadedOrganisation: function($rootScope, $stateParams, $q) {
				const organisationId = $stateParams.organisationId;

				if (organisationId === 'new') {
					const organisation = new Organisation();
					organisation.users.admins.push($rootScope.userCtx.email);
					return $q.when(organisation);
				}
				else
					return Organisation.get(organisationId);
			}
		}
	});

});


module.component('organisationMenu', {
	bindings: {
		loadedOrganisation: '<'
	},

	template: require('./menu.html'),

	controller: class OrganisationMenuController {

		$onChanges(changes) {
			this.organisation = this.loadedOrganisation;
		}

		onOrganisationSaveSuccess(newOrganisation) {
			this.organisation = newOrganisation;
		}

	}
});


export default module.name;

