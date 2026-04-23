import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth', {
    abstract: true,
    component: __componentName,
  });
});

module.component(__componentName, {
  template: '<ui-view></ui-view>',
});

export default module.name;
