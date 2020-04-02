import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import 'angular-legacy-sortablejs-maintained';
import mtElementGroups from '../../shared/misc/element-groups';
import mtColumnsPanel from '../../shared/misc/columns-panel';

const module = angular.module(__moduleName, [uiRouter, 'ng-sortable', mtElementGroups, mtColumnsPanel]);

module.config($stateProvider => {
	$stateProvider.state('main.project.structure.collection_form_list', {
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
			this.ngSortableOptions = {
				handle: '.handle',
				onUpdate: this.onFieldChange.bind(this)
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
			this.onProjectUpdate({ newProject: this.editableProject, isValid: true });
		}

		onCreateFormClicked() {
			this.$state.go('main.project.structure.collection_form_edition', { dataSourceId: uuid() });
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
