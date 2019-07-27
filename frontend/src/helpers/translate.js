import axios from 'axios';

/**
 * Allows calling the google translate API to translate strings.
 * A valid API key should be included in the config.json file for the service to work.
 *
 * @example
 * translate('Hello', 'fr', 'en') == Promise.resolve('bonjour')
 * translate('Hello', 'es', 'en') == Promise.resolve('buenos dias')
 *
 * // google translate can guess source language.
 * translate('Hello', 'fr') == Promise.resolve('bonjour')
 */
export default async function translate(text, targetLanguage, sourceLanguage) {
	const params = {
		q: text.replace(/\n/g, '<br/>'),
		key: window.GOOGLE_TRANSLATE_KEY,
		target: targetLanguage
	};

	if (sourceLanguage)
		params.source = sourceLanguage

	const result = await axios.get(
		'https://www.googleapis.com/language/translate/v2',
		{params: params}
	);

	return result.data
		.data.translations[0].translatedText
		// restore line breaks
		.replace(/ *<br *\/? *> */g, "\n")

		// remove escaped chars
		.replace(/&#(\d+);/g, (_, match) => String.fromCharCode(match));
};
