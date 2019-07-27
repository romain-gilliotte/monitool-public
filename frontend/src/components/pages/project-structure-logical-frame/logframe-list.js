import angular from 'angular';
import uuid from 'uuid/v4';

import uiRouter from '@uirouter/angularjs';
import 'angular-legacy-sortablejs-maintained';


const module = angular.module(
	'monitool.components.pages.project.structure.logicalframe.list',
	[
		uiRouter, // for $stateProvider
		'ng-sortable'
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project.structure.logical_frame_list', {
		acceptedUsers: ['loggedIn'],
		url: '/logical-frame',
		component: 'logicalFrameworkList'
	});
});


module.component('logicalFrameworkList', {

	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require('./logframe-list.html'),

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
			this.onProjectUpdate({newProject: this.editableProject, isValid: true});
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

