import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import 'angular-legacy-sortablejs-maintained';
import mtColumnsPanel from '../../shared/misc/columns-panel';

const module = angular.module(__moduleName, [uiRouter, 'ng-sortable', mtColumnsPanel]);

module.config($stateProvider => {

	$stateProvider.state('main.project.structure.logical_frame_list', {
		acceptedUsers: ['loggedIn'],
		url: '/logical-frame',
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

	controller: class ProjectLogicalFrameListController {

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

		onCreateLogicalFrameClicked(logicalFrame) {
			this.$state.go(
				'main.project.structure.logical_frame_edition',
				{
					logicalFrameId: uuid(),
					from: logicalFrame ? logicalFrame.id : null
				}
			);
		}

		onDeleteClicked(logicalFrame) {
			this.editableProject.logicalFrames.splice(
				this.editableProject.logicalFrames.indexOf(logicalFrame),
				1
			);

			this.onFieldChange();
		}
	}
});


export default module.name;

