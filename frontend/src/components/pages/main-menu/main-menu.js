import uiRouter from '@uirouter/angularjs';
import angular from 'angular';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('main', {
        abstract: true,
        component: __componentName
    });

});

module.component(__componentName, {
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