import angular from 'angular';
import Revision from '../../../models/revision';
import Project from '../../../models/project';
import uiRouter from '@uirouter/angularjs';
import mtRevisionSummary from './revision-summary';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter, mtRevisionSummary, mtHelpPanel]);

module.config($stateProvider => {

	$stateProvider.state('project.config.history', {
		url: '/history',
		component: __componentName
	});

});


module.component(__componentName, {

	bindings: {
		project: '<',
		onProjectUpdate: '&'
	},

	template: require(__templatePath),

	controller: class ProjectHistoryController {

		constructor($scope) {
			"ngInject";

			this.$scope = $scope;
		}

		$onChanges(changes) {
			if (changes.project) {
				this.selectedIndex = -1;

				// If the project was saved, or this is the first call, we reload everything.
				// Otherwise, the user just clicked on reset.
				// if (changes.project.isFirstChange()) {
				this.loading = false;
				this.finished = false;
				this.revisions = [];
				this._pageSize = 10;
				this._currentOffset = 0;
				this.onShowMoreClicked();
				// }
			}
		}

		onRestoreCliked(index) {
			this.selectedIndex = index;
			this.onProjectUpdate({
				newProject: new Project(this.revisions[index].before),
				isValid: true
			});
		}

		async onShowMoreClicked() {
			if (this.loading)
				return;

			this.loading = true;

			const newRevisions = await Revision.fetch(this.project._id, this._currentOffset, this._pageSize);
			this._currentOffset += this._pageSize;
			this.loading = false;
			this.finished = newRevisions.length < this._pageSize;
			this.revisions = [...this.revisions, ...newRevisions];
			Revision.enrich(this.project, this.revisions);
			this.$scope.$apply();
		}
	}
});


export default module.name;