import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import axios from 'axios';
import Cookies from 'js-cookie';
require(__scssPath);

const module = angular.module(__moduleName, [uiRouter]);

module.config($stateProvider => {
  $stateProvider.state('auth.login', {
    url: '/login',
    component: __componentName,
  });
});

module.component(__componentName, {
  template: require(__templatePath),
  controller: class {
    constructor($rootScope, $state, $window, $timeout, AuthService) {
      this.$rootScope = $rootScope;
      this.$state = $state;
      this.$window = $window;
      this.$timeout = $timeout;
      this.AuthService = AuthService;
      this.form = {
        email: '',
        password: '',
      };
      this.loading = false;
      this.error = null;
      this.isAuth0User = false;
      this.isAuth0User = false;
    }

    async login($event) {
      // Prevent default form submission
      if ($event) {
        $event.preventDefault();
      }
      if (!this.form.email || !this.form.password) {
        this.error = 'Please fill in all fields';
        return;
      }

      this.loading = true;
      this.error = null;
      this.isAuth0User = false;

      try {
        const response = await axios.post('/login', {
          email: this.form.email,
          password: this.form.password,
        });

        // Set authentication using the service
        this.AuthService.setAuthentication(response.data.token, response.data.user);
        this.$rootScope.$evalAsync(() => {
          this.$state.go('main.projects');
        });
      } catch (error) {
        this.$rootScope.$evalAsync(() => {
          this.error = error.response?.data?.error || 'Login failed';
          this.isAuth0User = error.response?.data?.isAuth0User || false;
        });
      } finally {
        this.$rootScope.$evalAsync(() => {
          this.loading = false;
        });
      }
    }

    loginWithGoogle() {
      this.$window.location.href = '/api/google';
    }

    loginWithMicrosoft() {
      this.$window.location.href = '/api/microsoft';
    }

    goToRegister() {
      this.$state.go('auth.register');
    }

    goToForgotPassword() {
      this.$state.go('auth.forgot-password');
    }

    resetAuth0Password() {
      // Pre-populate the forgot password form with the email if entered
      this.$state.go('auth.forgot-password', { email: this.form.email });
    }
  },
});

export default module.name;
