import angular from 'angular';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.min.css';
import mtPages from './components/pages/all-pages';
import mtFilterMisc from './filters/misc';
import mtTranslation from './translation/bootstrap';
require(__scssPath);
require('./small-bootstrap3.css');

const module = angular.module(__moduleName, [mtPages, mtTranslation, mtFilterMisc]);

module.config(function ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/projects');
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
module.run(function ($window, $transitions) {
    $transitions.onBefore({}, function (transition) {});

    // Scroll to top when changing page.
    $transitions.onSuccess({}, function (transition) {
        $window.scrollTo(0, 0);
    });

    $transitions.onError({}, function (transition) {
        const error = transition.error();
        console.log(error);
    });
});

// Set globals in $rootScope
module.run(function ($rootScope) {
    // Set api url (needed to download pdfs)
    $rootScope.serviceUrl = SERVICE_URL;

    // Set user profile
    $rootScope.profile = window.profile;
});

// Export a function which bootstraps the app instead of the module name.
// This is done so that when splitting the bundle, we can load AngularJS later.
export default () => angular.bootstrap(document, [module.name]);
