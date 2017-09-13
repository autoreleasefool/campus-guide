/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Joseph Roque
 * @created 2016-10-09
 * @file Translations.ts
 * @providesModule Translations
 * @description Defines a set of methods to easily get translations from objects.
 */
'use strict';

/** Shorthand for languages available in the application. English or French. */
export type Language =
  | 'en'
  | 'fr'
  ;

// Cache of the translations
const translations = {
  en: undefined,
  fr: undefined,
};

// Core translations
const CoreTranslations = require('../../assets/json/CoreTranslations');

// The current language of the application
let defaultLanguage: Language;

/**
 * Loads and parses a set of translations from the downloaded configuration.
 *
 * @param {Language} lang the set of translations to load
 * @returns {Promise<any>} a promise that resolves with the translations when they have been loaded
 */
async function _loadTranslations(lang: Language): Promise<any> {
  // If the language is already loaded,
  if (translations[lang] != undefined) {
    return translations[lang];
  }

  // Check for the configuration
  const Configuration = require('./Configuration');
  try {
    await Configuration.init();
  } catch (e) {
    throw e;
  }

  // Get the current translations
  try {
    translations[lang] = await Configuration.getConfig(`/translations.${lang}.json`);
  } catch (e) {
    throw e;
  }

  return translations[lang];
}

/**
 * Gets the French variant of a property from an object, or returns the default of the variant. If neither is
 * available, returns undefined.
 *
 * @param {string}            property the prefix of the property to look for
 * @param {oject | undefined} obj      the object to look in for the property
 * @returns {string|undefined} the French property in obj, the default property in obj, or undefined
 */
export function getFrenchVariant(property: string, obj: object | undefined): string | undefined {
  if (obj == undefined) {
    return undefined;
  }

  const frenchProperty = `${property}_fr`;
  if (frenchProperty in obj && obj[frenchProperty]) {
    return obj[frenchProperty];
  } else if (property in obj && obj[property]) {
    return obj[property];
  } else {
    return undefined;
  }
}

/**
 * Gets the English variant of a property from an object, or returns the default of the variant. If neither is
 * available, returns undefined.
 *
 * @param {string}           property the prefix of the property to look for
 * @param {object|undefined} obj      the object to look in for the property
 * @returns {string|undefined} the English property in obj, the default property in obj, or undefined
 */
export function getEnglishVariant(property: string, obj: object | undefined): string | undefined {
  if (obj == undefined) {
    return undefined;
  }

  const englishProperty = `${property}_en`;
  if (englishProperty in obj && obj[englishProperty]) {
    return obj[englishProperty];
  } else if (property in obj && obj[property]) {
    return obj[property];
  } else {
    return undefined;
  }
}

/**
 * Gets either the French or English translation of a property from an object, or undefined.
 *
 * @param {string}           property the property to retrieve appropriate translation of
 * @param {object|undefined} obj      the object to get the translation from
 * @param {Language}         language override the default language set by the user
 * @returns {string|undefined} the French or English translation of the property in the object, or undefined
 */
export function getVariant(
    property: string,
    obj: object | undefined,
    language: Language = defaultLanguage): string | undefined {
  if (language === 'en') {
    return getEnglishVariant(property, obj);
  } else if (language === 'fr') {
    return getFrenchVariant(property, obj);
  } else {
    return undefined;
  }
}

/**
 * Gets the French description of an object, or returns the default description. If neither is available,
 * returns undefined.
 *
 * @param {object|undefined} obj the object to look in for the description
 * @returns {string|undefined} the French description, the default description, or undefined
 */
export function getFrenchDescription(obj: object | undefined): string | undefined {
  return getFrenchVariant('description', obj);
}

/**
 * Gets the English description of an object, or returns the default description. If neither is available,
 * returns undefined.
 *
 * @param {object|undefined} obj the object to look in for the description
 * @returns {string|undefined} the English description, the default description, or undefined
 */
export function getEnglishDescription(obj: object | undefined): string | undefined {
  return getEnglishVariant('description', obj);
}

/**
 * Gets either the French or English description from an object, or undefined.
 *
 * @param {object|undefined} obj      the object to get the description from
 * @param {Language}         language override the default language set by the user
 * @returns {string|undefined} the French or English description of the object, or undefined
 */
export function getDescription(obj: object | undefined, language: Language = defaultLanguage): string | undefined {
  if (language === 'en') {
    return getEnglishDescription(obj);
  } else if (language === 'fr') {
    return getFrenchDescription(obj);
  } else {
    return undefined;
  }
}

/**
 * Gets the French link of an object, or returns the default link. If neither is available,
 * returns undefined.
 *
 * @param {object|undefined} obj the object to look in for the link
 * @returns {string|undefined} the French link, the default link, or undefined
 */
export function getFrenchLink(obj: object | undefined): string | undefined {
  return getFrenchVariant('link', obj);
}

/**
 * Gets the English link of an object, or returns the default link. If neither is available,
 * returns undefined.
 *
 * @param {object|undefined} obj the object to look in for the link
 * @returns {string|undefined} the English link, the default link, or undefined
 */
export function getEnglishLink(obj: object | undefined): string | undefined {
  return getEnglishVariant('link', obj);
}

/**
 * Gets either the French or English link from an object, or undefined.
 *
 * @param {object|undefined} obj      the object to get the link from
 * @param {Language}         language override the default language set by the user
 * @returns {string|undefined} the French or English link of the object, or undefined
 */
export function getLink(obj: object | undefined, language: Language = defaultLanguage): string | undefined {
  if (language === 'en') {
    return getEnglishLink(obj);
  } else if (language === 'fr') {
    return getFrenchLink(obj);
  } else {
    return undefined;
  }
}

/**
 * Gets the French name of an object, or returns the default name. If neither is available, returns undefined.
 *
 * @param {object|undefined} obj the object to look in for the name
 * @returns {string|undefined} the French name, the default name, or undefined
 */
export function getFrenchName(obj: object | undefined): string | undefined {
  return getFrenchVariant('name', obj);
}

/**
 * Gets the English name of an object, or returns the default name. If neither is available, returns undefined.
 *
 * @param {object|undefined} obj the object to look in for the name
 * @returns {string|undefined} the English name, the default name, or undefined
 */
export function getEnglishName(obj: object | undefined): string | undefined {
  return getEnglishVariant('name', obj);
}

/**
 * Gets either the French or English name from an object, or undefined.
 *
 * @param {object|undefined} obj      the object to get the name from
 * @param {Language}         language override the default language set by the user
 * @returns {string|undefined} the French or English name of the object, or undefined
 */
export function getName(obj: object | undefined, language: Language = defaultLanguage): string | undefined {
  if (language === 'en') {
    return getEnglishName(obj);
  } else if (language === 'fr') {
    return getFrenchName(obj);
  } else {
    return undefined;
  }
}

/**
 * Gets the translation of a certain string.
 *
 * @param {string}   property the string to get the translation of
 * @param {Language} language override the default language set by the user
 * @returns {string} the translated string, or any empty string if the translation is not available
 */
export function get(property: string, language: Language = defaultLanguage): string {
  if (CoreTranslations[language] != undefined
      && CoreTranslations[language][property] != undefined) {
    return CoreTranslations[language][property];
  } else if (translations[language] == undefined) {
    return '';
  } else {
    return translations[language][property] || '';
  }
}

/**
 * Loads and parses a set of translations from the downloaded configuration.
 *
 * @param {Language} lang the set of translations to load
 * @returns {Promise<any>} a promise that resolves with the translations when they have been loaded
 */
export function loadTranslations(lang: Language): Promise<any> {
  return _loadTranslations(lang);
}

/**
 * Removes a loaded set of translations.
 *
 * @param {Language} lang the set of translations to unload
 */
export function unloadTranslations(lang: Language): void {
  translations[lang] = undefined;
}

/**
 * Update the current language used by the app.
 *
 * @param {Language} newLanguage new language to set
 */
export function setLanguage(newLanguage: Language): void {
  defaultLanguage = newLanguage;
}

/**
 * Get the current language specified by the user.
 *
 * @returns {Language} the current language
 */
export function getLanguage(): Language {
  return defaultLanguage;
}

/**
 * Retrieves a set of translations, or an empty object if the set was not loaded.
 * Only available in testing.
 *
 * @param {Language} lang the set of translations to retrieve
 * @returns {any} a set of translations, or an empty object
 */
export function getTranslations(lang: Language): any {
  if (translations[lang] == undefined) {
    return {};
  } else {
    return translations[lang];
  }
}
