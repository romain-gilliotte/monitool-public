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

import mtFormGroup from '../../shared/misc/form-group';


const module = angular.module(
	'monitool.components.pages.organisation.structure.invitations',
	[
		uiRouter, // for $stateProvider

		mtFormGroup
	]
);


module.config($stateProvider => {
	$stateProvider.state('main.organisation.structure.invitations', {
		acceptedUsers: ['loggedIn'],
		url: '/invitations',
		component: 'organisationInvitation'
	});
});


module.component('organisationInvitation', {
	bindings: {
		// injected from parent component.
		organisation: '<',
		onOrganisationUpdate: '&'
	},

	template: require('./invitations.html'),

	controller: class OrganisationInvitationController {

		$onChanges(changes) {
			if (changes.organisation) {
				this.editableOrganisation = angular.copy(this.organisation);
			}
		}

		/**
		 * Called from ng-change on all inputs.
		 */
		onFieldChange() {
			this.onOrganisationUpdate({
				newOrganisation: this.editableOrganisation,
				isValid: true
			});
		}

	}
});


export default module.name;
