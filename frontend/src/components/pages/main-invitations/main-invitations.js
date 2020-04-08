import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
require(__cssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
    $stateProvider.state('main.invitations', {
        url: '/invitations',
        component: __componentName,
        resolve: {
        }
    });

});

module.component(__componentName, {
    template: require(__templatePath),

    controller: class {


    }
});

export default module.name;
