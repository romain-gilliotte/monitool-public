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
import User from '../../../models/user';

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
		component: 'organisationInvitation',
		resolve: {
			users: $stateParams => User.fetchForOrganisation($stateParams.organisationId)
		}
	});
});


module.component('organisationInvitation', {
	bindings: {
		// injected from parent component.
		organisation: '<',
		onOrganisationUpdate: '&',

		// resolved
		users: '<'
	},

	template: require('./invitations.html'),

	controller: class OrganisationInvitationController {

		$onChanges(changes) {
			if (changes.organisation) {
				this.editableOrganisation = angular.copy(this.organisation);
			}


			this.computeUsersByInvitation()
		}

		computeUsersByInvitation() {
			this.users.forEach(user => {
				// Get all invistations matching this user.
				user.invitations = this.organisation
					.invitations
					.filter(invitation => new RegExp(invitation.pattern).test(user.email));

				// Sort them depending on the role (owner goes first).
				user.invitations.sort((a, b) => {
					const perms = ['owner', 'readonly'];
					console.log(a, b, perms.indexOf(b.role) - perms.indexOf(a.role))
					return perms.indexOf(a.role) - perms.indexOf(b.role);
				});
			});

			this.usersByInvitation = {};
			this.organisation.invitations.forEach(invitation => {
				this.usersByInvitation[invitation.id] = this.users.filter(u => u.invitations[0] === invitation);
			});
		}

		onCreateInvitationClicked() {

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
