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
 * @file LanguageUtils.js
 * @providesModule LanguageUtils
 * @description Defines a set of methods to easily get translations from objects.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  Language,
} from 'types';

module.exports = {

  /**
   * Gets the French variant of a property from an object, or returns the default of the variant. If neither is
   * available, returns null.
   *
   * @param {string} property the prefix of the property to look for.
   * @param {?Object} obj     the object to look in for the property.
   * @returns {?string} the French property in obj, the default property in obj, or null.
   */
  getFrenchVariant(property: string, obj: ?Object): ?string {
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
  },

  /**
   * Gets the English variant of a property from an object, or returns the default of the variant. If neither is
   * available, returns null.
   *
   * @param {string} property the prefix of the property to look for.
   * @param {?Object} obj     the object to look in for the property.
   * @returns {?string} the English property in obj, the default property in obj, or null.
   */
  getEnglishVariant(property: string, obj: ?Object): ?string {
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
  },

  /**
   * Gets either the French or English translation of a property from an object, or null.
   *
   * @param {Language} language either 'en' or 'fr'
   * @param {string} property   the property to retrieve appropriate translation of
   * @param {?Object} obj       the object to get the translation from.
   * @returns {?string} the French or English translation of the property in the object, or null.
   */
  getTranslatedVariant(language: Language, property: string, obj: ?Object): ?string {
    if (language === 'en') {
      return this.getEnglishVariant(property, obj);
    } else if (language === 'fr') {
      return this.getFrenchVariant(property, obj);
    } else {
      return null;
    }
  },

  /**
   * Gets the French name of an object, or returns the default name. If neither is available, returns null.
   *
   * @param {?Object} obj the object to look in for the name.
   * @returns {?string} the French name, the default name, or null.
   */
  getFrenchName(obj: ?Object): ?string {
    return this.getFrenchVariant('name', obj);
  },

  /**
   * Gets the English name of an object, or returns the default name. If neither is available, returns null.
   *
   * @param {?Object} obj the object to look in for the name.
   * @returns {?string} the English name, the default name, or null.
   */
  getEnglishName(obj: ?Object): ?string {
    return this.getEnglishVariant('name', obj);
  },

  /**
   * Gets either the French or English translation name from an object, or null.
   *
   * @param {Language} language either 'en' or 'fr'
   * @param {?Object} obj       the object to get the name from.
   * @returns {?string} the French or English name of the object, or null.
   */
  getTranslatedName(language: Language, obj: ?Object): ?string {
    if (language === 'en') {
      return this.getEnglishName(obj);
    } else if (language === 'fr') {
      return this.getFrenchName(obj);
    } else {
      return null;
    }
  },
};
