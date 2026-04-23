import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
import { getPasswordStrength } from '../../../utils/password-strength';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth.register', {
    url: '/register',
    component: __componentName,
  });
});

module.component(__componentName, {
  template: require(__templatePath),
  controller: class {
    constructor($scope, $state, $window, $timeout) {
      this.$scope = $scope;
      this.$state = $state;
      this.$window = $window;
      this.$timeout = $timeout;
      this.form = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      };
      this.loading = false;
      this.error = null;
      this.success = false;
      this.successMessage = null;
    }

    async register($event) {
      // Prevent default form submission
      if ($event) {
        $event.preventDefault();
      }
      // Validation
      if (
        !this.form.name ||
        !this.form.email ||
        !this.form.password ||
        !this.form.confirmPassword
      ) {
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

      if (!this.isValidEmail(this.form.email)) {
        this.error = 'Please enter a valid email address';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post('/register', {
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
        });

        this.$scope.$apply(() => {
          this.success = true;
          this.successMessage = response.data.message || 'Registration successful!';
        });
      } catch (error) {
        this.$scope.$apply(() => {
          this.error = error.response?.data?.error || 'Registration failed';
        });
      } finally {
        this.$scope.$apply(() => {
          this.loading = false;
        });
      }
    }

    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    loginWithGoogle() {
      this.$window.location.href = '/api/google';
    }

    loginWithMicrosoft() {
      this.$window.location.href = '/api/microsoft';
    }

    goToLogin() {
      this.$state.go('auth.login');
    }

    getPasswordStrength() {
      return getPasswordStrength(this.form.password, this);
    }
  },
});

export default module.name;
