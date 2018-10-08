/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

import 'bootstrap/dist/css/bootstrap.css';
import '@bower_components/font-awesome/css/font-awesome.min.css';
import "./app.css";

import angular from 'angular';

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


module.run(function($rootScope) {
	$rootScope.userCtx = window.user;
});


module.config(function($urlRouterProvider) {
	$urlRouterProvider.otherwise('/home');
});


module.run(function($rootScope, $window, $transitions) {
	// Scroll to top when changing page.
	$transitions.onSuccess({}, function(transition) {
		$window.scrollTo(0, 0);
	});

	$transitions.onBefore({}, function(transition) {
		let userStatus;
		if (!$rootScope.userCtx)
			userStatus = 'unknown';
		else if ($rootScope.userCtx && $rootScope.userCtx.email)
			userStatus = 'loggedIn';
		else
			userStatus = 'loggedOut';

		// Check if the state is allowed for logged out users.
		if (!transition.to().acceptedUsers.includes(userStatus)) {
			return transition.router.stateService.target({
				unknown: 'init.checklogin',
				loggedOut: 'init.login',
				loggedIn: 'main.home'
			}[userStatus]);
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
