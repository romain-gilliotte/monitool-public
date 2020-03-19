import angular from 'angular';
import { v4 as uuid } from 'uuid';

import uiRouter from '@uirouter/angularjs';
import uiSelect from 'ui-select';
import 'angular-legacy-sortablejs-maintained';

import 'ui-select/dist/select.min.css';

import mtDatePickerOptional from '../../shared/ng-models/datepicker-optional';


const module = angular.module(
	'monitool.components.pages.project.structure.site',
	[
		uiRouter, // for $stateProvider
		uiSelect, // for site groups
		'ng-sortable', // order sites

		mtDatePickerOptional, // Datepicker start & end
	]
);


module.config($stateProvider => {
	$stateProvider.state('main.project.structure.collection_site_list', {
		acceptedUsers: ['loggedIn'],
		url: '/sites',
		component: 'projectSites'
	});
});


module.component('projectSites', {

	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require('./sites.html'),

	controller: class ProjectSitesController {

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
		 * Called from ng-change on all inputs:
		 * tell parent component that we updated the project.
		 */
		onFieldChange() {
			this.onProjectUpdate({
				newProject: this.editableProject,
				isValid: this.sitesForm.$valid
			});
		}

		onCreateEntityClicked() {
			this.editableProject.entities.push({ id: uuid(), name: '', start: null, end: null });
			this.onFieldChange();
		}

		onDeleteEntityClicked(entityId) {
			this.editableProject.entities = this.editableProject.entities.filter(e => e.id !== entityId);
			this.editableProject.sanitize();
			this.onFieldChange();
		}

		onCreateGroupClicked() {
			this.editableProject.groups.push({ id: uuid(), name: '', members: [] });
			this.onFieldChange();
		}

		onDeleteGroupClicked(groupId) {
			this.editableProject.groups = this.editableProject.groups.filter(group => group.id !== groupId);
			this.onFieldChange();
		}
	}
});


export default module.name;
