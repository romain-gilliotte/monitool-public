import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import uiModal from 'angular-ui-bootstrap/src/modal';
import 'angular-legacy-sortablejs-maintained';
import mtIndicatorDisplay from '../../shared/indicator/indicator';
import mtIndicatorModal from '../../shared/indicator/indicator-edition-modal';
import mtDirectiveAutoresize from '../../../directives/helpers/autoresize';
import mtDatePicker from '../../shared/ng-models/utc-datepicker';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__cssPath);

const module = angular.module(
	__moduleName,
	[
		uiRouter, // for $stateProvider
		uiModal, // for $uibModal
		'ng-sortable',

		mtIndicatorDisplay,
		mtIndicatorModal,
		mtDirectiveAutoresize,
		mtDatePicker,
		mtHelpPanel
	]
);


module.config($stateProvider => {

	$stateProvider.state('project.config.logical_frame_edition', {
		url: '/logical-frame/:logicalFrameId?from',
		component: __componentName,
		resolve: {
			logicalFrameId: $stateParams => $stateParams.logicalFrameId,
			from: $stateParams => $stateParams.from,
		}
	});
});


module.component(__componentName, {

	bindings: {
		// from parent component
		project: '<',
		onProjectUpdate: '&',

		// from ui-router
		logicalFrameId: '<',
		from: '<'
	},

	template: require(__templatePath),

	controller: class ProjectLogicalFrameEditController {

		constructor($uibModal) {
			this.$uibModal = $uibModal;
		}

		$onChanges(changes) {
			if (changes.project || changes.logicalFrameId) {
				const lfs = this.project.logicalFrames;

				// Edit specified logframe
				this.editableLogFrame =
					angular.copy(lfs.find(lf => lf.id === this.logicalFrameId));

				// Or copy an existing one
				if (!this.editableLogFrame) {
					this.editableLogFrame = angular.copy(lfs.find(lf => lf.id === this.from))
					if (this.editableLogFrame) {
						const m = this.editableLogFrame.name.match(/^(.*) \((\d+)\)$/);
						if (!m)
							this.editableLogFrame.name += ' (2)'
						else
							this.editableLogFrame.name = m[1] + ' (' + (parseInt(m[2]) + 1) + ')';
					}
				}

				// Or create a blank one.
				if (!this.editableLogFrame)
					this.editableLogFrame = {
						name: '', goal: '', start: null, end: null,
						entities: this.project.entities.map(s => s.id),
						indicators: [],
						purposes: []
					};

				this.specificDates = this.editableLogFrame.start ? 'yes' : 'no';

				// and make sure that the id is defined.
				this.editableLogFrame.id = this.logicalFrameId;
				this.onFieldChange();
			}
		}

		toggleSpecificDates() {
			if (this.specificDates === 'no') {
				this.editableLogFrame.start = this.editableLogFrame.end = null;
			}
			else {
				this.editableLogFrame.start = this.project.start;
				this.editableLogFrame.end = this.project.end;
			}

			this.onFieldChange();
		}

		$onInit() {
			// Allow purposes, outputs and indicators reordering. We need to hack around bugs
			// in current Sortable plugin implementation.
			// @see https://github.com/RubaXa/Sortable/issues/581
			// @see https://github.com/RubaXa/Sortable/issues/722
			this.purposeSortOptions = {
				group: 'purposes',
				handle: '.purpose-handle',
				onUpdate: this.onFieldChange.bind(this),
				onAdd: this.onFieldChange.bind(this)
			};

			this.outputSortOptions = {
				group: 'outputs',
				handle: '.output-handle',
				onUpdate: this.onFieldChange.bind(this),
				onAdd: this.onFieldChange.bind(this)
			};

			this.activitySortOptions = {
				group: 'activities',
				handle: '.activity-handle',
				onUpdate: this.onFieldChange.bind(this),
				onAdd: this.onFieldChange.bind(this)
			};

			this.indicatorsSortOptions = {
				group: 'indicators',
				handle: '.indicator-handle',
				onStart: () => document.body.classList.add('dragging'),
				onEnd: () => document.body.classList.remove('dragging'),
				onUpdate: this.onFieldChange.bind(this),
				onAdd: this.onFieldChange.bind(this)
			};
		}

		/**
		 * Called from ng-change on all inputs:
		 * tell parent component that we updated the project.
		 */
		onFieldChange() {
			const newProject = angular.copy(this.project);
			const index = newProject.logicalFrames.findIndex(lf => lf.id === this.logicalFrameId);

			if (index !== -1)
				newProject.logicalFrames[index] = this.editableLogFrame;
			else
				newProject.logicalFrames.push(this.editableLogFrame);

			this.onProjectUpdate({
				newProject: newProject,
				isValid: !!this.editableLogFrame.name && (!this.lfForm || this.lfForm.$valid)
			});
		}

		onSortableMouseEvent(group, enter) {
			if (group == 'outputs')
				this.purposeSortOptions.disabled = enter;
			else if (group == 'activities')
				this.purposeSortOptions.disabled = this.outputSortOptions.disabled = enter;
			else if (group == 'indicators')
				this.purposeSortOptions.disabled = this.outputSortOptions.disabled = this.activitySortOptions = enter;
		}

		onAddPurposeClicked() {
			this.editableLogFrame.purposes.push({
				description: "", assumptions: "", indicators: [], outputs: []
			});

			this.onFieldChange();
		}

		onAddOutputClicked(purpose) {
			purpose.outputs.push({
				description: "", activities: [], assumptions: "", indicators: []
			});

			this.onFieldChange();
		}

		onAddActivityClicked(output) {
			output.activities.push({
				description: "", indicators: []
			});

			this.onFieldChange();
		}

		onRemoveClicked(element, list) {
			list.splice(list.indexOf(element), 1);
			this.onFieldChange();
		}

		onIndicatorUpdated(newIndicator, formerIndicator, list) {
			const index = list.indexOf(formerIndicator);
			list.splice(index, 1, newIndicator);

			this.onFieldChange();
		}

		onIndicatorDeleted(indicator, list) {
			const index = list.indexOf(indicator);
			list.splice(index, 1);

			this.onFieldChange();
		}

		// handle indicator add, edit and remove are handled in a modal window.
		async onAddIndicatorClicked(parent) {
			const modalOpts = {
				component: 'indicatorEditionModal',
				size: 'lg',
				resolve: {
					planning: () => null,
					indicator: () => null,
					dataSources: () => this.project.forms
				}
			};

			const newPlanning = await this.$uibModal.open(modalOpts).result;
			if (newPlanning) {
				parent.push(newPlanning);
				this.onFieldChange();
			}
		}
	}
});


export default module.name;
