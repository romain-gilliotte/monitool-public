import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import infiniteScroll from 'ng-infinite-scroll';
import Project from '../../../models/project';
import Revision from '../../../models/revision';
import mtRevisionSummary from './revision-summary';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, infiniteScroll, mtRevisionSummary]);

module.config($stateProvider => {
    $stateProvider.state('project.config.history', {
        url: '/history',
        component: __componentName,
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
        onProjectUpdate: '&',
    },

    template: require(__templatePath),

    controller: class {
        constructor($scope) {
            'ngInject';

            this.$scope = $scope;
        }

        $onChanges(changes) {
            if (changes.project) {
                this.selectedIndex = -1;
                this.revisions = [];
                this.loadMore();
            }
        }

        onRestoreCliked(index) {
            this.selectedIndex = index;
            this.onProjectUpdate({
                newProject: new Project(this.revisions[index].before),
                isValid: true,
            });
        }

        async loadMore() {
            const pageSize = 20;
            this.infiniteScrollDisabled = true;

            const newRevisions = await Revision.fetch(
                this.project._id,
                this.revisions.length,
                pageSize
            );

            this.revisions.push(...newRevisions);
            Revision.enrich(this.project, this.revisions);
            if (newRevisions.length === pageSize) {
                this.infiniteScrollDisabled = false;
            }

            this.$scope.$apply();
        }
    },
});

export default module.name;
