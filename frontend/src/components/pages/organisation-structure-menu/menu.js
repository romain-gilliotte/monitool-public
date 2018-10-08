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


const module = angular.module(
	'monitool.components.pages.organisation.structure.menu',
	[
		uiRouter // for $stateProvider
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.organisation.structure', {
		abstract: true,
		component: 'organisationEditMenu',
	});

});


module.component('organisationEditMenu', {

	bindings: {
		organisation: '<',
		onOrganisationSaveSuccess: '&'
	},

	template: require('./menu.html'),

	controller: class OrganisationEditController {

		constructor($transitions, $filter, $scope, $state) {
			this.$transitions = $transitions;
			this.$scope = $scope;
			this.translate = $filter('translate');
			this.$state = $state;
		}

		$onChanges(changes) {
			if (changes.organisation) {
				// this.childOrganisation = angular.copy(this.organisation);
				this.organisationChanged = false;

				// Unknown until first change, but the user can't save if no changes were made anyway.
				// (organisation will be invalid in the case of blank organisation creation).
				this.organisationIsValid = true;
			}
		}

		$onInit() {
			this.organisationSaveRunning = false;

			// Listen for any change in the URL.
			this._cancelTransitionListener = this.$transitions.onStart(
				{},
				this._onTransition.bind(this)
			);
		}

		/**
		 * Called when the user tries to change the URL.
		 * This checks that no changes were made and unsaved.
		 */
		_onTransition(transition) {
			// If organisation is currently saving, disable all links
			if (this.organisationSaveRunning) {
				transition.abort();
				return;
			}

			// FIXME: the only patches that should be accepted w/o saving
			// are creating logical frameworks, data sources and variables (depending on the transition).

			// If organisation is changed, warn user that changes will be lost.
			const warning = this.translate('shared.sure_to_leave');
			if (this.organisationChanged && !window.confirm(warning)) {
				transition.abort();
				return;
			}

			// Either organisation has not changed, or the user is OK with loosing changes.
			// => We are leaving.
			this.onResetClicked();
			if (!transition.to().name.startsWith('main.organisation.structure'))
				this._cancelTransitionListener();
		}

		/**
		 * Called by child component when they update their copy of the organisation.
		 * We replace our editable copy of the organisation and update flags.
		 */
		onOrganisationUpdate(newOrganisation, isValid) {
			this.childOrganisation = angular.copy(newOrganisation);
			this.organisationChanged = !angular.equals(this.organisation, this.childOrganisation);
			this.organisationIsValid = isValid;

			console.log('updated child organisation.')
		}

		/**
		 * Called by clicking on the save button.
		 */
		async onSaveClicked() {
			// When button is disabled, do not execute action.
			if (this.organisationChanged && this.organisationIsValid && !this.organisationSaveRunning) {
				this.organisationSaveRunning = true;

				try {
					await this.childOrganisation.save();

					// Tell parent component that we saved the organisation.
					this.onOrganisationSaveSuccess({newOrganisation: this.childOrganisation});
				}
				catch (error) {
					// Display message to tell user that it's not possible to save.
					alert(this.translate('organisation.saving_failed'));
				}
				finally {
					this.$scope.$apply(() => {
						this.organisationSaveRunning = false;
					});
				}
			}
		}

		onResetClicked() {
			// When button is disabled, do not execute action.
			if (this.organisationChanged && !this.organisationSaveRunning) {
				// Trigger $onChanges on children components.
				this.organisation = angular.copy(this.organisation);
				this.organisationChanged = false;
				this.organisationIsValid = true;
			}
		}
	}
});


export default module.name;

