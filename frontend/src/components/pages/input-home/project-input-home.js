import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import Input from '../../../models/input';
import axios from 'axios';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('project.usage.home', {
        url: '/input-home',
        component: __componentName,
        resolve: {
            users: $stateParams =>
                axios.get(`/project/${$stateParams.projectId}/user`).then(r => r.data),
        },
    });
});

module.component(__componentName, {
    bindings: {
        project: '<',
        invitations: '<',
        users: '<',
        uploads: '<',
    },
    template: require(__templatePath),
    controller: class {
        constructor($scope, $rootScope) {
            'ngInject';

            this.$scope = $scope;
            this.$rootScope = $rootScope;
        }

        async $onChanges(changes) {
            const myEmail = this.$rootScope.profile.email;
            const myInvitation = this.invitations.find(i => i.email === myEmail);

            // A datasource is active if we can perform data entry in at least one site.
            this.activeDataSources = this.project.forms.filter(ds => {
                // FIXME this was copy pasted from input-menu
                const mySites = myInvitation
                    ? myInvitation.dataEntry.siteIds
                    : this.project.entities.map(s => s.id);
                const myDss = myInvitation
                    ? myInvitation.dataEntry.dataSourceIds
                    : this.project.forms.map(ds => ds.id);

                return (
                    ds.active &&
                    ds.elements.some(variable => variable.active) &&
                    myDss.includes(ds.id) &&
                    ds.entities.some(
                        siteId =>
                            this.project.entities.find(site => site.id == siteId).active &&
                            mySites.includes(siteId)
                    )
                );
            });

            this.status = {};
            this.activeDataSources.forEach(async ds => {
                const siteIds = myInvitation ? myInvitation.dataEntry.siteIds : null;
                this.status[ds.id] = await Input.fetchFormShortStatus(this.project, ds.id, siteIds);
                this.$scope.$apply();
            });
        }
    },
});

export default module.name;
