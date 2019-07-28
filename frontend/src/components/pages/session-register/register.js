import angular from 'angular';
import axios from 'axios';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(
	'monitool.components.pages.register',
	[
		uiRouter, // for $stateProvider
	]
);

module.config($stateProvider => {

	$stateProvider.state('init.register', {
		acceptedUsers: ['loggedOut'],
		url: '/register',
		component: 'register'
	});
});


module.component('register', {
	bindings: {
	},
	template: require('./register.html'),
	controller: class RegisterController {

		constructor($scope, $rootScope, $state) {
			this.$scope = $scope;
			this.$rootScope = $rootScope;
			this.$state = $state;
		}

		async onRegisterClicked() {
			if (this.password != this.password2) {
				this.errorMessage = 'password_dont_match';
				return;
			}

			try {
				await axios.post('/authentication/register', {
					email: this.email,
					password: this.password
				});

				this.isWaitingToken = true;
				this.$scope.$apply();
			}
			catch (e) {
				console.log(e)
				this.errorMessage = e.response.data.error;
				this.$scope.$apply();
			}
		}

		async onValidateEmailClicked() {
			try {
				this.errorMessage = null;

				// Validate the user email
				await axios.post('/authentication/validate-email', {
					email: this.email,
					token: this.token
				});

				this.logUserIn(this.email, this.password);
			}
			catch (e) {
				this.errorMessage = e.response.data.error;
				this.$scope.$apply();
			}
		}

		onResetClicked() {
			this.email = this.password = this.token = '';
			this.isWaitingToken = false;
		}

		async logUserIn(email, password) {
			// Log the user in.
			const response = await axios.post('/authentication/login', {
				email: email,
				password: password
			});

			window.localStorage.token = response.data.token;

			// Setup default axios header.
			axios.defaults.headers.common['Authorization'] = window.localStorage.token;

			// Put user in $rootScope
			const payload = atob(window.localStorage.token.split('.')[1]);

			this.$rootScope.userCtx = JSON.parse(payload);
			this.$state.go('main.projects')
		}
	}
})


export default module.name;
