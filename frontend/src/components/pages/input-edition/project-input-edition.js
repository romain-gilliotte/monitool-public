import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import TimeSlot from 'timeslot-dag';
import mtTimeSlot from '../../../filters/time-slot';
import Input from '../../../models/input';
import mtHelpPanel from '../../shared/misc/help-panel';
import mtSaveBlock from '../../shared/project/save-block';
import mtInputGrid from './input-grid';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, mtTimeSlot, mtInputGrid, mtSaveBlock, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.usage.edit', {
		url: '/input/:dataSourceId/edit/:period/:entityId',
		component: __componentName,
		resolve: {
			dsId: $stateParams => $stateParams.dataSourceId,
			period: $stateParams => $stateParams.period,
			siteId: $stateParams => $stateParams.entityId,
			input: (loadedProject, $stateParams) => {
				return Input.fetchInput(loadedProject, $stateParams.entityId, $stateParams.dataSourceId, $stateParams.period);
			},
			previousInput: (loadedProject, $stateParams) => {
				const previousPeriod = new TimeSlot($stateParams.period).previous().value;
				return Input.fetchInput(loadedProject, $stateParams.entityId, $stateParams.dataSourceId, previousPeriod);
			},
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

	controller: class {

		get isUnchanged() {
			return angular.equals(this.master, this.input)
		}

		constructor($scope, $state, $transitions, $filter) {
			"ngInject";

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

			this.master = angular.copy(this.input);

			this.variablesById = {};
			this.project.forms.forEach(form => {
				form.elements.forEach(variable => this.variablesById[variable.id] = variable);
			});
		}

		fillWithZeros() {
			this.input.content.forEach(content => {
				content.data = content.data.map(d => d ? d : 0);
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
				alert(this.translate('project.saving_failed'));
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
