import angular from 'angular';

import Revision from '../../../models/revision';
import Project from '../../../models/project';

import uiRouter from '@uirouter/angularjs';

import mtRevisionSummary from './revision-summary';

const module = angular.module(
	'monitool.components.pages.project.structure.history.history',
	[
		uiRouter, // for $stateProvider

		mtRevisionSummary
	]
);


module.config($stateProvider => {

	$stateProvider.state('main.project.structure.history', {
		acceptedUsers: ['loggedIn'],
		url: '/history',
		component: 'history'
	});

});


module.component('history', {

	bindings: {
		project: '<',
		onProjectUpdate: '&'
	},

	template: require('./history.html'),

	controller: class ProjectHistoryController {

		constructor($scope) {
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

		onShowMoreClicked() {
			if (this.loading)
				return;

			const promise = Revision.fetch(this.project._id, this._currentOffset, this._pageSize)
			this._currentOffset += this._pageSize;
			this.loading = true;

			promise.then(newRevisions => {
				this.$scope.$apply(() => {
					this.loading = false;
					this.finished = newRevisions.length < this._pageSize;
					this.revisions = [...this.revisions, ...newRevisions];
					Revision.enrich(this.project, this.revisions);
				});
			});
		}
	}
});


export default module.name;