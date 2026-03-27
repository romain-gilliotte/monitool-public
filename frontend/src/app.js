import angular from 'angular';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import mtPages from './components/pages/all-pages';
import mtFilterMisc from './filters/misc';
import mtTranslation from './translation/bootstrap';
import authService from './services/auth-service';
require(__scssPath);
require('./small-bootstrap3.css');

const module = angular.module(__moduleName, [mtPages, mtTranslation, mtFilterMisc, authService]);

module.config(function ($urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector, $location) {
    const $state = $injector.get('$state');
    const AuthService = $injector.get('AuthService');

    // Check authentication status and redirect appropriately
    return AuthService.checkAuthentication().then(isAuth => {
      if (isAuth) {
        $state.go('main.projects');
      } else {
        $state.go('auth.login');
      }
    });
  });
});

module.config(function ($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist(['self', SERVICE_URL + '/**']);
});

module.config(function ($compileProvider) {
  // $compileProvider.debugInfoEnabled(false);
  $compileProvider.commentDirectivesEnabled(false);
  $compileProvider.cssClassDirectivesEnabled(false);
});

// Hook angular-ui-router transitions.
module.run(function ($window, $state, $transitions) {
  $transitions.onBefore({}, function (transition) {});

  // Scroll to top when changing page.
  $transitions.onSuccess({}, function (transition) {
    $window.scrollTo(0, 0);
  });

  $transitions.onError({}, function (transition) {
    const error = transition.error();

    // error might be a rejected promise or an error object
    Promise.reject(error).catch(e => {
      // If the error is an axios error, show the message from the server.
      const message =
        e.detail.isAxiosError && e.detail?.response?.data?.message
          ? e.detail?.response?.data?.message
          : String(e.detail);

      $state.go('error', { message });
    });
  });
});

// Set globals in $rootScope
module.run(function ($rootScope, AuthService) {
  // Set api url (needed to download pdfs)
  $rootScope.serviceUrl = SERVICE_URL;

  // Initialize authentication service
  AuthService.initialize()
    .then(() => {
      // Authentication is now initialized
      $rootScope.$apply();
    })
    .catch(error => {
      console.error('Failed to initialize authentication:', error);
    });
});

// Export a function which bootstraps the app instead of the module name.
// This is done so that when splitting the bundle, we can load AngularJS later.
export default () => angular.bootstrap(document, [module.name]);
