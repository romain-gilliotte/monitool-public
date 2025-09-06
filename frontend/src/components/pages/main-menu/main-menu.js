import uiRouter from '@uirouter/angularjs';
import angular from 'angular';
import axios from 'axios';
import Project from '../../../models/project';
require(__scssPath);

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
      },
    },
  });
});

module.component(__componentName, {
  bindings: {
    projects: '<',
    invitations: '<',
  },
  template: require(__templatePath),

  controller: class {
    constructor($rootScope, $state, $window, AuthService) {
      this.$rootScope = $rootScope;
      this.$state = $state;
      this.$window = $window;
      this.AuthService = AuthService;
    }

    async logout() {
      await this.AuthService.logout();
      this.$state.go('auth.login');
    }
  },
});

export default module.name;
