import angular from 'angular';

import ngTranslate from 'angular-translate';
import ngTranslateLocalStorage from 'angular-translate-storage-local';
import ngTranslateCookieStorage from 'angular-translate-storage-cookie';
import ngCookies from 'angular-cookies';

import frenchTranslation from './fr/translations';
import englishTranslation from './en/translations';
import spanishTranslation from './es/translations';

import frenchLocale from './fr/locale';
import englishLocale from './en/locale';
import spanishLocale from './es/locale';

const module = angular.module(__moduleName, [
    ngTranslate,
    ngTranslateLocalStorage,
    ngTranslateCookieStorage,
    ngCookies,
]);

/**
 * Init translation modules
 */
module.config(function ($translateProvider) {
    $translateProvider.translations('fr', frenchTranslation);
    $translateProvider.translations('en', englishTranslation);
    $translateProvider.translations('es', spanishTranslation);

    $translateProvider.useLocalStorage();
    $translateProvider.useSanitizeValueStrategy('escapeParameters');

    $translateProvider.preferredLanguage(
        ['en', 'es', 'fr'].includes(window.profile.locale) ? window.profile.locale : 'en'
    );
});

module.run(function ($translate, $rootScope, $locale) {
    // Set list of available languages
    $rootScope.languages = { fr: 'french', en: 'english', es: 'spanish' };

    // Expose scope function to change the language everywhere in the application.
    $rootScope.changeLanguage = function (langKey) {
        $translate.use(langKey);

        if (langKey == 'fr') angular.copy(frenchLocale, $locale);
        else if (langKey == 'es') angular.copy(spanishLocale, $locale);
        else angular.copy(englishLocale, $locale);

        $rootScope.language = langKey;

        // Broadcast event in case components are using one-time binding
        // and want to listen for this to redraw.
        $rootScope.$broadcast('languageChange');

        // Datepickers are listening to this even to update.
        $rootScope.$broadcast('$localeChangeSuccess', langKey, $locale);
    };

    // Set initial language from cookie/local storage
    $rootScope.changeLanguage($translate.use());
});

export default module.name;
