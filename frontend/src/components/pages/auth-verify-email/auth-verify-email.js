import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth.verify-email', {
    url: '/verify-email?token',
    component: __componentName,
  });
});

module.component(__componentName, {
  template: require(__templatePath),
  controller: class {
    constructor($state, $stateParams, $timeout, $scope) {
      this.$state = $state;
      this.$scope = $scope;
      this.token = $stateParams.token;
      this.loading = true;
      this.error = null;
      this.success = false;

      $timeout(() => this.verifyEmail(), 100);
    }

    async verifyEmail() {
      if (!this.token) {
        this.error = 'Invalid or missing verification token';
        this.loading = false;
        return;
      }

      try {
        await axios.get(`/verify-email?token=${this.token}`);
        this.success = true;
        this.loading = false;
        this.$scope.$apply();
      } catch (error) {
        console.error('Email verification failed:', error);

        if (error.response?.data?.error) {
          this.error = error.response.data.error;
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          this.error = 'Network error. Please check your connection and try again.';
        } else {
          this.error = 'Email verification failed. Please try again later.';
        }

        this.loading = false;
        this.$scope.$apply();
      }
    }

    goToLogin() {
      this.$state.go('auth.login');
    }
  },
});

export default module.name;
