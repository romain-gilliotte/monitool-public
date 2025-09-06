import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth.reset-password', {
    url: '/reset-password?token',
    component: __componentName,
  });
});

module.component(__componentName, {
  template: require(__templatePath),
  controller: class {
    constructor($state, $stateParams, $scope) {
      this.$state = $state;
      this.$scope = $scope;
      this.token = $stateParams.token;
      this.form = {
        password: '',
        confirmPassword: '',
      };
      this.loading = false;
      this.error = null;
      this.success = false;

      if (!this.token) {
        this.error = 'Invalid or missing reset token';
      }
    }

    async resetPassword() {
      // Validation
      if (!this.form.password || !this.form.confirmPassword) {
        this.error = 'Please fill in all fields';
        return;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      if (this.form.password.length < 8) {
        this.error = 'Password must be at least 8 characters long';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await axios.post('/reset-password', {
          token: this.token,
          password: this.form.password,
        });

        this.success = true;
        this.loading = false;
        this.$scope.$apply();
      } catch (error) {
        console.error('Password reset failed:', error);

        // Handle different types of errors
        if (error.response?.data?.error) {
          this.error = error.response.data.error;
        } else if (error.code === 'NETWORK_ERROR' || !error.response) {
          this.error = 'Network error. Please check your connection and try again.';
        } else {
          this.error = 'Password reset failed. Please try again later.';
        }

        this.loading = false;
        this.$scope.$apply();
      }
    }

    goToLogin() {
      this.$state.go('auth.login');
    }

    getPasswordStrength() {
      const password = this.form.password;
      if (!password) {
        this._cachedPasswordStrength = null;
        return null;
      }

      // Cache the result to prevent infinite digest loops
      if (this._lastPassword === password && this._cachedPasswordStrength) {
        return this._cachedPasswordStrength;
      }

      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;

      let result;
      if (strength <= 2) result = { level: 'weak', text: 'Weak' };
      else if (strength <= 3) result = { level: 'medium', text: 'Medium' };
      else result = { level: 'strong', text: 'Strong' };

      // Cache the result
      this._lastPassword = password;
      this._cachedPasswordStrength = result;
      return result;
    }
  },
});

export default module.name;
