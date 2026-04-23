import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth.forgot-password', {
    url: '/forgot-password?email',
    component: __componentName,
  });
});

module.component(__componentName, {
  template: require(__templatePath),
  controller: class {
    constructor($state, $stateParams, $scope) {
      this.$state = $state;
      this.$scope = $scope;
      this.form = {
        email: $stateParams.email || '',
      };
      this.loading = false;
      this.error = null;
      this.success = false;
    }

    async requestReset() {
      if (!this.form.email) {
        this.error = 'Please enter your email address';
        return;
      }

      if (!this.isValidEmail(this.form.email)) {
        this.error = 'Please enter a valid email address';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await axios.post('/forgot-password', {
          email: this.form.email,
        });

        this.success = true;
        this.loading = false;
        this.$scope.$apply();
      } catch (error) {
        console.error('Password reset request failed:', error);

        // Handle different types of errors
        if (error.response?.data?.error) {
          this.error = error.response.data.error;
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          this.error = 'Network error. Please check your connection and try again.';
        } else {
          this.error = 'Request failed. Please try again later.';
        }

        this.loading = false;
        this.$scope.$apply();
      }
    }

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    goToLogin() {
      this.$state.go('auth.login');
    }

    goToRegister() {
      this.$state.go('auth.register');
    }
  },
});

export default module.name;
