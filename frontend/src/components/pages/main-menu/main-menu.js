import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import Project from '../../../models/project';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('main', {
        abstract: true,
        component: __componentName,
        resolve: {
            projects: () => Project.fetchAll(),
            invitations: async () => {
                const response = await axios.get(`/invitation`);
                return response.data;
            }
        }
    });

});

module.component(__componentName, {
    bindings: {
        projects: '<',
        invitations: '<'
    },
    template: require(__templatePath),

    controller: class {
        logout() {
            window.auth0.logout({
                returnTo: window.location.origin
            });
        }
    }
});

export default module.name;