import angular from 'angular';
import axios from 'axios';
import uiRouter from '@uirouter/angularjs';

const module = angular.module(
	'monitool.components.pages.login',
	[
		uiRouter, // for $stateProvider
	]
);

module.config($stateProvider => {

	$stateProvider.state('init.login', {
		acceptedUsers: ['loggedOut'],
		url: '/login',
		component: 'login'
	});
});


module.component('login', {
	bindings: {
	},
	template: require('./login.html'),
	controller: class LoginController {

		constructor($scope, $rootScope, $state) {
			this.$scope = $scope;
			this.$rootScope = $rootScope;
			this.$state = $state;
		}

		$onInit() {
			this.isWaitingToken = false;
		}

		onResetClicked() {
			this.email = this.password = this.token = '';
			this.isWaitingToken = false;
		}

		async onLoginClicked() {
			try {
				this.errorMessage = null;

				if (this.isWaitingToken && this.token) {
					await axios.post('/api/authentication/validate-email', {
						email: this.email,
						token: this.token
					});
				}

				const response = await axios.post('/api/authentication/login', {
					email: this.email,
					password: this.password
				});

				window.localStorage.token = response.data.token;

				// Setup default axios header.
				axios.defaults.headers.common['Authorization'] = window.localStorage.token;

				// Put user in $rootScope
				const payload = atob(window.localStorage.token.split('.')[1]);
				this.$rootScope.userCtx = JSON.parse(payload);

				this.$state.go('main.projects');
			}
			catch (e) {
				if (e.response.data.error == 'need_email_validation') {
					this.isWaitingToken = true;
					this.validationSentAt = e.response.data.detail.sentAt;
				}
				else
					this.errorMessage = e.response.data.error;

				this.$scope.$apply();
			}
		}
	}
});


export default module.name;
