import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import 'angular-legacy-sortablejs-maintained';
import mtElementGroups from '../../shared/misc/element-groups';
import mtColumnsPanel from '../../shared/misc/columns-panel';
import mtHelpPanel from '../../shared/misc/help-panel';

const module = angular.module(__moduleName, [uiRouter, 'ng-sortable', mtElementGroups, mtColumnsPanel, mtHelpPanel]);

module.config($stateProvider => {
	$stateProvider.state('project.config.collection_form_list', {
		url: '/data-source',
		component: __componentName
	});
});


module.component(__componentName, {
	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require(__templatePath),

	controller: class ProjectDataSourcesController {

		constructor($state) {
			this.$state = $state;
		}

		$onInit() {
			this.dataSourceSortOptions = {
				group: 'datasources',
				handle: '.ds-handle',
				onUpdate: this.onFieldChange.bind(this)
			};

			this.variableSortOptions = {
				group: 'variables',
				onStart: () => document.body.classList.add('dragging'),
				onEnd: () => document.body.classList.remove('dragging'),
				onUpdate: this.onFieldChange.bind(this), // triggered when moving in the same list.
				onAdd: this.onFieldChange.bind(this), // triggered when moving from one list to another.
			};
		}

		$onChanges(changes) {
			// Project is a single way data bindings: we must not change it.
			if (changes.project)
				this.editableProject = angular.copy(this.project);
		}

		/**
		 * Called from onUpdate for the list reordering:
		 * tell parent component that we updated the project.
		 */
		onFieldChange() {
			// Remove empty forms.
			if (this.editableProject.forms.some(ds => !ds.elements.length))
				this.editableProject.forms = this.editableProject.forms.filter(ds => ds.elements.length);

			this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}

		onCreateFormClicked() {
			this.$state.go('project.config.collection_form_edition', { dataSourceId: uuid() });
		}

		onDeleteClicked(dataSource) {
			this.editableProject.forms.splice(
				this.editableProject.forms.indexOf(dataSource),
				1
			);

			this.onFieldChange();
		}

	}
});


export default module.name;
