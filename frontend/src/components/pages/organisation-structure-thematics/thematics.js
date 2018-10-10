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
	'monitool.components.pages.organisation.structure.thematics',
	[
		uiRouter, // for $stateProvider

		mtFormGroup
	]
);


module.config($stateProvider => {
	$stateProvider.state('main.organisation.structure.thematics', {
		acceptedUsers: ['loggedIn', 'unknown'],
		url: '/thematics',
		component: 'organisationThematics'
	});
});


module.component('organisationThematics', {
	bindings: {
		// injected from parent component.
		organisation: '<',
		onOrganisationUpdate: '&'
	},

	template: require('./thematics.html'),

	controller: class OrganisationThematicsController {

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
				isValid: this.thematicsForm.$valid
			});
		}

	}
});


export default module.name;
