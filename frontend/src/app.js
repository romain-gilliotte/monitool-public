import 'bootstrap/dist/css/bootstrap.css';
import '@bower_components/font-awesome/css/font-awesome.min.css';
import "./app.css";

import "regenerator-runtime/runtime";

import angular from 'angular';
import axios from 'axios';

import auth from './auth';
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

module.config(function ($urlRouterProvider) {
	$urlRouterProvider.otherwise('/projects');
});

// Hook angular-ui-router transitions.
module.run(function ($window, $rootScope, $transitions) {

	$transitions.onBefore({}, function (transition) {
	});

	// Scroll to top when changing page.
	$transitions.onSuccess({}, function (transition) {
		$window.scrollTo(0, 0);
	});

	$transitions.onError({}, function (transition) {
		const error = transition.error();
		console.log(error);
	});

})

// Start angular if authentication worked.
auth.userhandler = {
	onSuccess: function (result) {
		const accessToken = result.accessToken.jwtToken;
		const email = result.idToken.payload.email;

		module.run(function ($rootScope) {
			// Configure axios
			axios.defaults.baseURL = SERVICE_URL;
			axios.defaults.headers.common['Authorization'] = accessToken;

			// Set api url in $rootScope (needed to download pdfs)
			$rootScope.serviceUrl = SERVICE_URL

			// Put user email in $rootScope
			$rootScope.userEmail = email;
		});

		angular.bootstrap(document, [module.name]);
	},
	onFailure: function (err) {
		console.log("Error!", err);
	}
};

auth.setState(window.location.href); // Save route requested by the user, because checking auth
auth.getSession(); // authenticate if needed

