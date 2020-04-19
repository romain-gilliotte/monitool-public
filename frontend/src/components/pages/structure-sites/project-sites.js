import angular from 'angular';
import { v4 as uuid } from 'uuid';
import uiRouter from '@uirouter/angularjs';
import uiSelect from 'ui-select';
import 'angular-legacy-sortablejs-maintained';
import 'ui-select/dist/select.min.css';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__cssPath);

const module = angular.module(
	__moduleName,
	[
		uiRouter, // for $stateProvider
		uiSelect, // for site groups
		'ng-sortable', // order sites
		mtHelpPanel
	]
);


module.config($stateProvider => {
	$stateProvider.state('project.config.collection_site_list', {
		url: '/sites',
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

	controller: class ProjectSitesController {

		constructor($filter) {
			"ngInject";

			this.translate = $filter('translate');
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
		 * Called from ng-change on all inputs:
		 * tell parent component that we updated the project.
		 */
		onFieldChange() {
			this.onProjectUpdate({
				newProject: this.editableProject,
				isValid: this.editableProject.entities.every(s => s.name.length > 0)
					&& this.editableProject.groups.every(g => g.name.length > 0 && g.members.length > 0)
			});
		}

		onCreateSiteClicked() {
			this.editableProject.entities.push({ id: uuid(), name: '', active: true });
			this.onFieldChange();
		}

		onChangeSiteStatusClicked(site, newStatus) {
			site.active = newStatus;
			this.onFieldChange();
		}

		onDeleteSiteClicked(site) {
			var question = this.translate('project.confirm_delete_site');

			if (window.confirm(question)) {
				this.editableProject.entities = this.editableProject.entities.filter(s => s !== site);
				this.editableProject.sanitize();
				this.onFieldChange();
			}
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
