/**
 *
 * @license
 * Copyright (C) 2016 Joseph Roque
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
 * @file TranslationUtils.js
 * @providesModule TranslationUtils
 * @description Defines a set of methods to easily get translations from objects.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  Language,
} from 'types';

// Cache of the translations
const translations: Object = {
  en: null,
  fr: null,
};

import * as Configuration from 'Configuration';

/**
 * Loads and parses a set of translations from the downloaded configuration.
 *
 * @param {Language} language the set of translations to load
 * @returns {Promise<Object>} a promise that resolves with the translations when they have been loaded.
 */
async function _loadTranslations(language: Language): Promise < Object > {
  // If the language is already loaded,
  if (translations[language] != null) {
    return translations[language];
  }

  // Check for the configuration
  try {
    await Configuration.init();
  } catch (e) {
    throw e;
  }

  // Get the current translations
  try {
    translations[language] = await Configuration.getConfig('/translations.' + language + '.json');
    return translations[language];
  } catch (e) {
    throw e;
  }
}

/**
 * Gets the French variant of a property from an object, or returns the default of the variant. If neither is
 * available, returns null.
 *
 * @param {string} property the prefix of the property to look for.
 * @param {?Object} obj     the object to look in for the property.
 * @returns {?string} the French property in obj, the default property in obj, or null.
 */
export function getFrenchVariant(property: string, obj: ?Object): ?string {
  if (obj == null) {
    return null;
  }

  const frenchProperty = property + '_fr';
  if (frenchProperty in obj) {
    return obj[frenchProperty];
  } else if (property in obj) {
    return obj[property];
  } else {
    return null;
  }
}

/**
 * Gets the English variant of a property from an object, or returns the default of the variant. If neither is
 * available, returns null.
 *
 * @param {string} property the prefix of the property to look for.
 * @param {?Object} obj     the object to look in for the property.
 * @returns {?string} the English property in obj, the default property in obj, or null.
 */
export function getEnglishVariant(property: string, obj: ?Object): ?string {
  if (obj == null) {
    return null;
  }

  const englishProperty = property + '_en';
  if (englishProperty in obj) {
    return obj[englishProperty];
  } else if (property in obj) {
    return obj[property];
  } else {
    return null;
  }
}

/**
 * Gets either the French or English translation of a property from an object, or null.
 *
 * @param {Language} language either 'en' or 'fr'
 * @param {string} property   the property to retrieve appropriate translation of
 * @param {?Object} obj       the object to get the translation from.
 * @returns {?string} the French or English translation of the property in the object, or null.
 */
export function getTranslatedVariant(language: Language, property: string, obj: ?Object): ?string {
  if (language === 'en') {
    return getEnglishVariant(property, obj);
  } else if (language === 'fr') {
    return getFrenchVariant(property, obj);
  } else {
    return null;
  }
}

/**
 * Gets the French name of an object, or returns the default name. If neither is available, returns null.
 *
 * @param {?Object} obj the object to look in for the name.
 * @returns {?string} the French name, the default name, or null.
 */
export function getFrenchName(obj: ?Object): ?string {
  return getFrenchVariant('name', obj);
}

/**
 * Gets the English name of an object, or returns the default name. If neither is available, returns null.
 *
 * @param {?Object} obj the object to look in for the name.
 * @returns {?string} the English name, the default name, or null.
 */
export function getEnglishName(obj: ?Object): ?string {
  return getEnglishVariant('name', obj);
}

/**
 * Gets either the French or English translation name from an object, or null.
 *
 * @param {Language} language either 'en' or 'fr'
 * @param {?Object} obj       the object to get the name from.
 * @returns {?string} the French or English name of the object, or null.
 */
export function getTranslatedName(language: Language, obj: ?Object): ?string {
  if (language === 'en') {
    return getEnglishName(obj);
  } else if (language === 'fr') {
    return getFrenchName(obj);
  } else {
    return null;
  }
}

/**
 * Loads and parses a set of translations from the downloaded configuration.
 *
 * @param {Language} language the set of translations to load
 * @returns {Promise<Object>} a promise that resolves with the translations when they have been loaded.
 */
export function loadTranslations(language: Language): Promise < Object > {
  return _loadTranslations(language);
}

/**
 * Removes a loaded set of translations.
 *
 * @param {Language} language the set of translations to unload
 */
export function unloadTranslations(language: Language): void {
  translations[language] = null;
}

/**
 * Retrieves a set of translations, or an empty object if the set was not loaded.
 *
 * @param {Language} language the set of translations to retrieve
 * @returns {Object} a set of translations, or an empty object
 */
export function getTranslations(language: Language): Object {
  if (translations[language] == null) {
    return {};
  } else {
    return translations[language];
  }
}

/**
 * Gets the string representation of a day's numerical value, in the language requested.
 *
 * @param {Language} language either 'fr' or 'en' for the language needed
 * @param {number} val        numerical representation of day, 0 - 6, where 0 is Monday, 6 is Sunday.
 * @returns {?string} the string representation of the day, or null if val is invalid
 */
export function numberToDay(language: Language, val: number): ?string {
  const CoreTranslations: Object = require('../../assets/json/CoreTranslations.json');

  /* eslint-disable no-magic-numbers */
  /* Documentation states 0 = Monday, 6 = Sunday */

  switch (val) {
    case 0: return CoreTranslations[language].monday;
    case 1: return CoreTranslations[language].tuesday;
    case 2: return CoreTranslations[language].wednesday;
    case 3: return CoreTranslations[language].thursday;
    case 4: return CoreTranslations[language].friday;
    case 5: return CoreTranslations[language].saturday;
    case 6: return CoreTranslations[language].sunday;
    default: return null;
  }

  /* eslint-enable no-magic-numbers */
}
