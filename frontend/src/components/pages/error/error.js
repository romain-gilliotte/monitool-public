import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('error', {
        url: '/error/:message',
        component: __componentName,
        resolve: {
            message: $stateParams => $stateParams.message,
        },
    });
});

module.component(__componentName, {
    bindings: {
        message: '<',
    },
    template: require(__templatePath),
    controller: class {
        constructor() {
            'ngInject';
        }
    },
});

export default module.name;
