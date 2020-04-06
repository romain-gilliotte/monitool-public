import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import uiSelect from 'ui-select';
import 'angular-legacy-sortablejs-maintained';
import 'ui-select/dist/select.min.css';
import mtOptionalDate from '../../shared/ng-models/optional-date';
import mtElementFilter from '../../shared/ng-models/element-filter';
import mtPartitionList from './partition-list';
import mtPartitionDistribution from './partition-distribution';
import mtPartitionOrder from './partition-order';
import mtHelpPanel from '../../shared/misc/help-panel';

const module = angular.module(
	__moduleName,
	[
		uiRouter, // for $stateProvider
		'ng-sortable',

		uiSelect, // for partition group members

		mtOptionalDate, // Datepicker start & end
		mtElementFilter, // Sites & groups associated with form
		mtPartitionList,
		mtPartitionDistribution,
		mtPartitionOrder,
		mtHelpPanel
	]
);


module.config($stateProvider => {

	$stateProvider.state('project.structure.collection_form_edition', {
		url: '/data-source/:dataSourceId',
		component: __componentName,
		resolve: {
			dsId: $stateParams => $stateParams.dataSourceId
		}
	});
});


module.component(__componentName, {

	bindings: {
		// From ui-router resolve
		dsId: '<',

		// From parent component
		project: '<',
		onProjectUpdate: '&',
	},

	template: require(__templatePath),

	controller: class DataSourceEdition {

		$onChanges(changes) {
			if (changes.project || changes.dsId) {
				// Are we creating a new data source?
				this.editableDataSource = angular.copy(this.project.forms.find(ds => ds.id == this.dsId));
				if (!this.editableDataSource) {
					this.editableDataSource = { id: this.dsId, name: '', periodicity: 'month', entities: [], start: null, end: null, elements: [] };
					this.onFieldChange();
				}
			}
		}

		$onInit() {
			this.visibleVariableId = null;

			this.sortableOptions = {
				handle: '.variable-handle',
				onUpdate: this.onFieldChange.bind(this)
			};
		}

		/**
		 * Called from ng-change on all inputs:
		 * tell parent component that we updated the project.
		 */
		onFieldChange() {
			const newProject = angular.copy(this.project);
			const index = newProject.forms.findIndex(ds => ds.id === this.dsId);

			if (index !== -1)
				newProject.forms[index] = this.editableDataSource;
			else
				newProject.forms.push(this.editableDataSource);

			this.onProjectUpdate({
				newProject: newProject,
				isValid:
					// if the form is not loaded yet (calling from $onChanges), we can consider
					// than the data source is not valid (because we know it's blank).
					this.dsForm && this.dsForm.$valid &&

					// Don't allow to save data sources with no variables.
					this.editableDataSource.elements.length > 0 &&

					// Check that the variable have a name for validity.
					// There is a 'required' directive on the form, however, some inputs are not there
					// because of a 'ng-if' directive => they are not considered for validation.
					// (Using ng-show to hide the panels content is too slow: 300ms to render the page).
					this.editableDataSource.elements.reduce((m, v) => m && v.name.length > 0, true)
			});
		}

		onAddVariableClicked() {
			const newVariable = {
				id: uuid(),
				name: "",
				partitions: [],
				distribution: 0,
				geoAgg: 'sum',
				timeAgg: 'sum'
			};

			this.editableDataSource.elements.push(newVariable);
			this.onToggleVariableClicked(newVariable.id);
			this.onFieldChange();
		}

		onRemoveVariableClicked(item) {
			const index = this.editableDataSource.elements.findIndex(arrItem => item.id === arrItem.id);

			this.editableDataSource.elements.splice(index, 1)
			this.onFieldChange();
		}

		onToggleVariableClicked(variableId) {
			this.visibleVariableId = this.visibleVariableId !== variableId ? variableId : null;
		}

		onPartitionUpdate(variable, newPartitions) {
			if (variable.partitions.length !== newPartitions.length)
				variable.distribution = Math.ceil(variable.partitions.length / 2);

			variable.partitions = newPartitions;
			this.onFieldChange();
		}

	}
});


export default module.name;