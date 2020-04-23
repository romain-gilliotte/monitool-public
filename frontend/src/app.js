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

module.run(function ($rootScope) {
    // Set api url in $rootScope (needed to download pdfs)
    $rootScope.serviceUrl = SERVICE_URL;

    // Put user email in $rootScope
    $rootScope.profile = window.profile;
});

export default () => angular.bootstrap(document, [module.name]);
