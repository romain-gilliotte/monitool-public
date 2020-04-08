import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import angular from 'angular';
import axios from 'axios';
import createAuth0Client from '@auth0/auth0-spa-js';
import mtPages from './components/pages/all-pages';
import mtTranslation from './translation/bootstrap';
import mtFilterMisc from './filters/misc';
require(__cssPath)

async function authenticate() {
	const auth0 = window.auth0 = await createAuth0Client({
		domain: "monitool.eu.auth0.com",
		client_id: "z31Kt6FYp8YDG4BypH4qp1ibLd1Ns4ME",
		audience: "https://api.monitool.org"
	});


	// Handle callback
	const query = window.location.search;
	if (query.includes("code=") && query.includes("state=")) {
		// Process the login state
		await auth0.handleRedirectCallback();

		// Use replaceState to redirect the user away and remove the querystring parameters
		window.history.replaceState({}, document.title, "/");
	}

	// If authenticated, start app
	const isAuthenticated = await auth0.isAuthenticated();
	if (isAuthenticated) {
		const accessToken = await auth0.getTokenSilently();
		const profile = await auth0.getUser();

		startApp(accessToken, profile);
	}
	// otherwise, go login
	else {
		await auth0.loginWithRedirect({
			redirect_uri: window.location.origin
		});
	}
}

function startApp(accessToken, profile) {
	const module = angular.module(__moduleName, [mtPages, mtTranslation, mtFilterMisc]);

	module.config(function ($urlRouterProvider) {
		$urlRouterProvider.otherwise('/projects');
	});

	module.config(function ($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			SERVICE_URL + '/**'
		]);
	});

	// Hook angular-ui-router transitions.
	module.run(function ($window, $transitions) {

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

	module.run(function ($rootScope) {
		// Configure axios
		axios.defaults.baseURL = SERVICE_URL;
		axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

		// Set api url in $rootScope (needed to download pdfs)
		$rootScope.serviceUrl = SERVICE_URL
		$rootScope.accessToken = accessToken;

		// Put user email in $rootScope
		$rootScope.profile = profile;
	});

	angular.bootstrap(document, [module.name]);
}

authenticate()
