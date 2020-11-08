import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import infiniteScroll from 'ng-infinite-scroll';
import TimeSlot from 'timeslot-dag';
import mtFilterTimeSlot from '../../../filters/time-slot';
import Input from '../../../models/input';
require(__scssPath);

const PAGE_SIZE = 50;

const module = angular.module(__moduleName, [uiRouter, infiniteScroll, mtFilterTimeSlot]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.list', {
        url: '/input/:dataSourceId/list',
        component: __componentName,
        resolve: {
            dataSourceId: $stateParams => $stateParams.dataSourceId,
        },
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
        dataSourceId: '<',
        invitations: '<',
    },
    template: require(__templatePath),

    controller: class {
        constructor($rootScope, $state, $scope) {
            'ngInject';

            this.$state = $state;
            this.$scope = $scope;
            this.email = $rootScope.profile.email;
        }

        $onChanges(changes) {
            // Convenience
            this.dataSource = this.project.forms.find(ds => ds.id === this.dataSourceId);
            this.periods = this.computePeriods(this.project, this.dataSource);
            this.sites = this.computeSites(
                this.project,
                this.dataSource,
                this.invitations,
                this.email
            );

            // Containers for data which will be loaded.
            this.loadedPeriods = [];
            this.inputsStatus = {};
        }

        /** List all periods relevant to this datasource */
        computePeriods(project, dataSource) {
            const periodicity = dataSource.periodicity;
            const start = TimeSlot.fromValue(project.start).toParentPeriodicity(periodicity);
            const last = TimeSlot.fromValue(project.end).toParentPeriodicity(periodicity);

            let current = TimeSlot.fromDate(new Date(), periodicity).previous();
            if (current.value > last.value) {
                current = last;
            }

            const periods = [];
            while (current.value > start.value) {
                periods.push(current.value);
                current = current.previous();
            }

            return periods;
        }

        /** Define sites (depending on user permissions) */
        computeSites(project, dataSource, invitations, userEmail) {
            const myInvitation = invitations.find(i => i.email === userEmail);

            return project.entities.filter(
                e =>
                    e.active &&
                    dataSource.entities.includes(e.id) &&
                    (!myInvitation || myInvitation.dataEntry.siteIds.includes(e.id))
            );
        }

        /** Load rows, called by the infinite-scroll plugin */
        async loadMore() {
            this.infiniteScrollDisabled = true;

            const newPeriods = this.periods.splice(0, PAGE_SIZE);
            const newData = await Input.fetchFormStatus(
                this.project,
                this.dataSourceId,
                this.sites.map(s => s.id),
                [newPeriods[newPeriods.length - 1], newPeriods[0]]
            );

            this.loadedPeriods = [...this.loadedPeriods, ...newPeriods];
            this.inputsStatus = { ...this.inputsStatus, ...newData };
            this.infiniteScrollDisabled = this.periods.length == 0;

            this.$scope.$apply();
        }

        addInput(entityId) {
            this.$state.go('project.usage.edit', {
                period: this.newInputDate,
                dataSourceId: this.dataSource.id,
                entityId: entityId,
            });
        }
    },
});

export default module.name;
