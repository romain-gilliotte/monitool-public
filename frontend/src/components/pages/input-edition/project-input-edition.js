import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import mtFilterTimeSlot from '../../../filters/time-slot';
import Input from '../../../models/input';
import mtInputGrid from './input-grid';

const module = angular.module(__moduleName, [uiRouter, mtFilterTimeSlot, mtInputGrid]);

module.config($stateProvider => {

	$stateProvider.state('main.project.input.edit', {
		acceptedUsers: ['loggedIn'],
		url: '/input/:dataSourceId/edit/:period/:entityId',
		component: __componentName,
		resolve: {
			inputs: (loadedProject, $stateParams) => Input.fetchLasts(loadedProject, $stateParams.entityId, $stateParams.dataSourceId, $stateParams.period),
			input: inputs => inputs.current,
			previousInput: inputs => inputs.previous,
			dsId: $stateParams => $stateParams.dataSourceId,
			period: $stateParams => $stateParams.period,
			siteId: $stateParams => $stateParams.entityId
		}
	});
});

module.component(__componentName, {
	bindings: {
		project: '<',
		dsId: '<',
		period: '<',
		siteId: '<',

		input: '<',
		previousInput: '<',
	},

	template: require(__templatePath),

	controller: class ProjectInputEditionController {

		get isUnchanged() {
			return angular.equals(this.master, this.input)
		}

		constructor($scope, $state, $transitions, $filter) {
			this.$scope = $scope;
			this.$state = $state;
			this.$transitions = $transitions;
			this.translate = $filter('translate');
		}

		$onInit() {
			this._pageChangeWatch = this.$transitions.onStart({}, transition => {
				// if changes were made.
				const hasChanged = !angular.equals(this.master, this.input);
				if (hasChanged) {
					// then ask the user if he meant to abandon changes
					const hasConfirmed = window.confirm(this.translate('shared.sure_to_leave'))
					if (hasConfirmed)
						// We're leaving because the user does not mind losing changes => stop listening.
						this._pageChangeWatch();
					else
						// Stay on the page.
						transition.abort();
				}
				else
					// We're leaving because the data entry did not change => stop listening.
					this._pageChangeWatch();
			});
		}

		$onChanges(changes) {
			this.form = this.project.forms.find(f => f.id === this.dsId);
			this.entity = this.project.entities.find(f => f.id === this.siteId);

			// replace values which were never entered by zeroes
			// this.input.content.forEach(content => {
			// 	content.data = content.data.map(v => v === null ? 0 : v);
			// });

			this.master = angular.copy(this.input);

			this.variablesById = {};
			this.project.forms.forEach(form => {
				form.elements.forEach(variable => this.variablesById[variable.id] = variable);
			});
		}

		copy() {
			// bad naming.
			this.previousInput.content.forEach((content, index) => {
				this.input.content[index].data = content.data;
			})
		}

		async save() {
			if (this.isUnchanged || this.inputForm.$invalid || this.inputSaving)
				return;

			try {
				this.inputSaving = true;
				await this.input.save();
				angular.copy(this.input, this.master);
			}
			catch (error) {
				let errorMessage = 'project.saving_failed_other';
				alert(this.translate(errorMessage));
			}
			finally {
				this.inputSaving = false;
				this.$scope.$apply();
			}
		}

		reset() {
			angular.copy(this.master, this.input);
		}

	}
});


export default module.name;
