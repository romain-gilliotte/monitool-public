import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
import Cookies from 'js-cookie';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth.oauth-callback', {
    url: '/oauth-callback?token&error',
    component: __componentName,
  });
});

module.component(__componentName, {
  template: require(__templatePath),
  controller: class {
    constructor($rootScope, $state, $stateParams, $window, $timeout, AuthService) {
      this.$rootScope = $rootScope;
      this.$state = $state;
      this.$window = $window;
      this.AuthService = AuthService;
      this.loading = true;
      this.error = null;

      $timeout(() => this.handleCallback($stateParams), 100);
    }

    async handleCallback(params) {
      if (params.error) {
        this.error = 'OAuth authentication failed. Please try again.';
        this.loading = false;
        return;
      }

      if (!params.token) {
        this.error = 'No authentication token received.';
        this.loading = false;
        return;
      }

      try {
        // Get user profile using the token
        axios.defaults.headers['Authorization'] = `Bearer ${params.token}`;
        const response = await axios.get('/me');

        // Set authentication using the service
        this.AuthService.setAuthentication(params.token, response.data.user);

        // Redirect to main app
        this.$state.go('main.projects');
      } catch (error) {
        console.error('OAuth callback error:', error);
        this.error = 'Authentication failed. Please try again.';
        this.loading = false;
      }
    }

    goToLogin() {
      this.$state.go('auth.login');
    }
  },
});

export default module.name;
