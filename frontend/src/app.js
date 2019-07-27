import 'bootstrap/dist/css/bootstrap.css';
import '@bower_components/font-awesome/css/font-awesome.min.css';
import "./app.css";

import angular from 'angular';
import axios from 'axios';

import mtPages from './components/pages/all-pages';
import mtTranslation from './translation/bootstrap';
import mtFilterMisc from './filters/misc';

const module = angular.module(
	'monitool.app',
	[
		mtPages,
		mtTranslation,
		mtFilterMisc
	]
);

module.config(function($urlRouterProvider) {
	$urlRouterProvider.otherwise('/projects');
});

// Scroll to top when changing page.
module.run(function ($window, $transitions) {
	$transitions.onSuccess({}, function(transition) {
		$window.scrollTo(0, 0);
	});
})


module.run(function($rootScope, $window, $transitions) {
	if (window.localStorage.token) {
		// Setup default axios header.
		axios.defaults.headers.common['Authorization'] = window.localStorage.token;

		// Put user in $rootScope
		const payload = atob(window.localStorage.token.split('.')[1]);
		$rootScope.userCtx = JSON.parse(payload);
	}

	$transitions.onBefore({}, function(transition) {
		const userStatus = !!$rootScope.userCtx ? 'loggedIn' : 'loggedOut';

		// Check if the state is allowed for logged out users.
		if (!transition.to().acceptedUsers.includes(userStatus)) {
			const destination = { loggedOut: 'init.login', loggedIn: 'main.projects' }[userStatus];
			return transition.router.stateService.target(destination);
		}
	});

	$transitions.onError({}, function(transition) {
		const error = transition.error();

		// console.log(error)

		// // If we got an error because we're not logged in, let's do that and come back.
		// const needLogin =
		// 	// Tried to transition without being logged in.
		// 	error.detail.message == 'not_logged_in'
		// 	// Called the API with an invalid cookie
		// 	|| (error.detail.response && error.detail.response.status === 401);

		// if (needLogin) {
		// 	console.log('hello')
		// 	delete $rootScope.userCtx;
		// 	$state.go('init.login');
		// 	return;
		// }

		// // Tried to access /login or /register while being logged in.
		// if (error.message == 'logged_in') {
		// 	$state.go('main.home');
		// 	return;
		// }
	});
});

angular.bootstrap(document, [module.name]);
