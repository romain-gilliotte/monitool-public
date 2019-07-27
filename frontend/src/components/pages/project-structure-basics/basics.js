import angular from 'angular';

import uiRouter from '@uirouter/angularjs';

import 'ui-select/dist/select.min.css';

import mtUtcDatepicker from '../../shared/ng-models/datepicker';
import mtFormGroup from '../../shared/misc/form-group';


const module = angular.module(
	'monitool.components.pages.project.structure.basics',
	[
		uiRouter, // for $stateProvider

		mtUtcDatepicker, // Datepicker start & end
		mtFormGroup
	]
);


module.config($stateProvider => {
	$stateProvider.state('main.project.structure.basics', {
		acceptedUsers: ['loggedIn'],
		url: '/basics',
		component: 'projectBasics'
	});
});


module.component('projectBasics', {
	bindings: {
		// injected from parent component.
		project: '<',
		onProjectUpdate: '&'
	},

	template: require('./basics.html'),

	controller: class ProjectBasicsController {

		$onChanges(changes) {
			if (changes.project) {
				this.editableProject = angular.copy(this.project);
			}
		}

		/**
		 * Called from ng-change on all inputs.
		 */
		onFieldChange() {
			this.onProjectUpdate({
				newProject: this.editableProject,
				isValid: this.basicsForm.$valid
			});
		}

	}
});


export default module.name;
