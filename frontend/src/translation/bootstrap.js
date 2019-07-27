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


const module = angular.module(
	'monitool.translation',
	[
		ngTranslate,
		ngTranslateLocalStorage,
		ngTranslateCookieStorage,
		ngCookies
	]
);


/**
 * Init translation modules
 */
module.config(function($translateProvider) {
	$translateProvider.translations('fr', frenchTranslation);
	$translateProvider.translations('en', englishTranslation);
	$translateProvider.translations('es', spanishTranslation);

	$translateProvider.useLocalStorage();
	$translateProvider.preferredLanguage('fr');
	$translateProvider.useSanitizeValueStrategy('escapeParameters');
});


module.run(function($translate, $rootScope, $locale) {
	// Set list of available languages
	$rootScope.languages = {fr: "french", en: "english", es: 'spanish'};

	// Expose scope function to change the language everywhere
	// in the application.
	$rootScope.changeLanguage = function(langKey) {
		$translate.use(langKey);

		if (langKey == 'fr')
			angular.copy(frenchLocale, $locale);
		else if (langKey == 'es')
			angular.copy(spanishLocale, $locale);
		else
			angular.copy(englishLocale, $locale);

		$rootScope.language = langKey;
		$rootScope.$broadcast('languageChange');
		$rootScope.$broadcast('$localeChangeSuccess', langKey, $locale);
	};

	// Set initial language from cookie/local storage
	$rootScope.changeLanguage($translate.use());
});


export default module.name;
