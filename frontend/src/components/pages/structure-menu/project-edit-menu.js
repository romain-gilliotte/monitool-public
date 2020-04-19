import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import mtSaveBlock from '../../shared/project/save-block';
import mtProjectColumns from '../../shared/project/project-columns';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, mtSaveBlock, mtProjectColumns]);

module.config($stateProvider => {

	$stateProvider.state('project.config', {
		abstract: true,
		component: __componentName,
	});
});

module.component(__componentName, {

	bindings: {
		project: '<',
		invitations: '<',
		onProjectSaveSuccess: '&'
	},

	template: require(__templatePath),

	controller: class ProjectEditController {

		constructor($transitions, $filter, $scope, $state) {
			"ngInject";

			this.$transitions = $transitions;
			this.$scope = $scope;
			this.translate = $filter('translate');
			this.$state = $state;
		}

		$onChanges(changes) {
			if (changes.project) {
				// this.childProject = angular.copy(this.project);
				this.projectChanged = false;

				// Unknown until first change, but the user can't save if no changes were made anyway.
				// (project will be invalid in the case of blank project creation).
				this.projectIsValid = true;
			}
		}

		$onInit() {
			this.projectSaveRunning = false;

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
			// If project is currently saving, disable all links
			if (this.projectSaveRunning) {
				transition.abort();
				return;
			}

			// FIXME: the only patches that should be accepted w/o saving
			// are creating logical frameworks, data sources and variables (depending on the transition).

			// If project is changed, warn user that changes will be lost.
			const warning = this.translate('shared.sure_to_leave');
			if (this.projectChanged && !window.confirm(warning)) {
				transition.abort();
				return;
			}

			// Either project has not changed, or the user is OK with loosing changes.
			// => We are leaving.
			this.onResetClicked();
			if (!transition.to().name.startsWith('project.config'))
				this._cancelTransitionListener();
		}

		/**
		 * Called by child component when they update their copy of the project.
		 * We replace our editable copy of the project and update flags.
		 */
		onProjectUpdate(newProject, isValid) {
			this.childProject = angular.copy(newProject);
			this.projectChanged = !angular.equals(this.project, this.childProject);
			this.projectIsValid = isValid;
		}

		/**
		 * Called by clicking on the save button.
		 */
		async onSaveClicked() {
			// When button is disabled, do not execute action.
			if (this.projectChanged && this.projectIsValid && !this.projectSaveRunning) {
				this.projectSaveRunning = true;

				try {
					this.childProject.sanitize();
					await this.childProject.save();

					// Tell parent component that we saved the project.
					this.onProjectSaveSuccess({ newProject: this.childProject });
				}
				catch (error) {
					// Display message to tell user that it's not possible to save.
					alert(this.translate('project.saving_failed'));
				}
				finally {
					this.$scope.$apply(() => {
						this.projectSaveRunning = false;
					});
				}
			}
		}

		onResetClicked() {
			// When button is disabled, do not execute action.
			if (this.projectChanged && !this.projectSaveRunning) {
				// Trigger $onChanges on children components.
				this.project = angular.copy(this.project);
				this.projectChanged = false;
				this.projectIsValid = true;
			}
		}
	}
});


export default module.name;

