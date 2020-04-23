import angular from 'angular';
import Input from '../../../models/input';
import uiRouter from '@uirouter/angularjs';
import mtFilterTimeSlot from '../../../filters/time-slot';
import mtHelpPanel from '../../shared/misc/help-panel';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter, mtFilterTimeSlot, mtHelpPanel]);

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
        constructor($element, $rootScope, $state, $scope) {
            'ngInject';

            this.$state = $state;
            this.$scope = $scope;
            this.userEmail = $rootScope.profile.email;
            this._element = $element;
        }

        $onInit() {
            this._binded = this._onScroll.bind(this);
        }

        $onDestroy() {
            if (this._container) this._container.unbind('scroll', this._binded);
        }

        _onScroll() {
            this.headerStyle = {
                transform: 'translate(0, ' + this._container[0].scrollTop + 'px)',
            };

            this.firstColStyle = {
                transform: 'translate(' + this._container[0].scrollLeft + 'px)',
            };

            this.$scope.$apply();
        }

        $onChanges(changes) {
            // Define form
            this.dataSource = this.project.forms.find(ds => ds.id === this.dataSourceId);

            // Define sites (depending on user permissions)
            const myInvitation = this.invitations.find(i => i.email === this.userEmail);
            this.sites = this.project.entities.filter(
                e =>
                    e.active &&
                    this.dataSource.entities.includes(e.id) &&
                    (!myInvitation || myInvitation.dataEntry.siteIds.includes(e.id))
            );

            this.loading = true;
            this.load();
        }

        async load() {
            const myInvitation = this.invitations.find(i => i.email === this.userEmail);
            const siteIds = myInvitation ? myInvitation.dataEntry.siteIds : null;

            this.inputsStatus = await Input.fetchFormStatus(
                this.project,
                this.dataSourceId,
                siteIds
            );

            // Those list tell which rows should be displayed.
            this.visibleStatus = Object.keys(this.inputsStatus).slice(0, 20);
            this.hiddenStatus = Object.keys(this.inputsStatus).slice(20);

            this.loading = false;
            this.$scope.$apply();

            // if there are results, bind a scroll event to the div around the table.
            // this is extremely hacky and will break when the template is changed. There must be a better way
            if (this.visibleStatus.length) {
                this._container = angular.element(this._element.children()[0]);
                this._container.bind('scroll', this._binded);
            }
        }

        showMore() {
            this.visibleStatus.push(...this.hiddenStatus.splice(0, 10));
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
