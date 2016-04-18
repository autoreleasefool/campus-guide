/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * LanguageUtils.js
 *
 * @description
 * Defines a set of methods to easily get translations from objects.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

module.exports = {

  /**
   * Gets the French variant of a property from an object, or returns the
   * default of the variant. If neither is available, returns null.
   *
   * @param property the prefix of the property to look for.
   * @param obj      the object to look in for the property.
   * @return the French property in obj, the default property in obj, or null.
   */
  _getFrenchVariant(property, obj) {
    let frenchProperty = property + '_fr';
    if (frenchProperty in obj) {
      return obj[frenchProperty];
    } else if (property in obj) {
      return obj[property];
    } else {
      return null;
    }
  },

  /**
   * Gets the English variant of a property from an object, or returns the
   * default of the variant. If neither is available, returns null.
   *
   * @param property the prefix of the property to look for.
   * @param obj      the object to look in for the property.
   * @return the English property in obj, the default property in obj, or null.
   */
  _getEnglishVariant(property, obj) {
    let englishProperty = property + '_en';
    if (englishProperty in obj) {
      return obj[englishProperty];
    } else if (property in obj) {
      return obj[property];
    } else {
      return null;
    }
  },

  /**
   * Gets the French name of an object, or returns the default name. If
   * neither is available, returns null.
   *
   * @param obj the object to look in for the name.
   * @return the French name, the default name, or null.
   */
  getFrenchName(obj) {
    return this._getFrenchVariant('name', obj);
  },

  /**
   * Gets the English name of an object, or returns the default name. If
   * neither is available, returns null.
   *
   * @param obj the object to look in for the name.
   * @return the English name, the default name, or null.
   */
  getEnglishName(obj) {
    return this._getEnglishVariant('name', obj);
  },

  /**
   * Gets the French link of an object, or returns the default link. If
   * neither is available, returns null.
   *
   * @param obj the object to look in for the link.
   * @return the French link, the default link, or null.
   */
  getFrenchLink(obj) {
    return this._getFrenchVariant('link', obj);
  },

  /**
   * Gets the English link of an object, or returns the default link. If
   * neither is available, returns null.
   *
   * @param obj the object to look in for the link.
   * @return the English link, the default link, or null.
   */
  getEnglishLink(obj) {
    return this._getEnglishVariant('link', obj);
  },

  /**
   * Gets the French details of an object, or returns the default details. If
   * neither is available, returns null.
   *
   * @param obj the object to look in for the details.
   * @return the French details, the default details, or null.
   */
  getFrenchDetails(obj) {
    return this._getFrenchVariant('details', obj);
  },

  /**
   * Gets the English details of an object, or returns the default details. If
   * neither is available, returns null.
   *
   * @param obj the object to look in for the details.
   * @return the English details, the default details, or null.
   */
  getEnglishDetails(obj) {
    return this._getEnglishVariant('details', obj);
  },

  /**
   * Gets either the French or English translation name from an object, or null.
   *
   * @param language either 'en' or 'fr'
   * @param obj the object to get the name from.
   * @return the French or English name of the object, or null.
   */
  getTranslatedName(language, obj) {
    if (language === 'en') {
      return this.getEnglishName(obj);
    } else if (language === 'fr') {
      return this.getFrenchName(obj);
    } else {
      return null;
    }
  },

  /**
   * Gets either the French or English translation link from an object, or null.
   *
   * @param language either 'en' or 'fr'
   * @param obj the object to get the link from.
   * @return the French or English link of the object, or null.
   */
  getTranslatedLink(language, obj) {
    if (language === 'en') {
      return this.getEnglishLink(obj);
    } else if (language === 'fr') {
      return this.getFrenchLink(obj);
    } else {
      return null;
    }
  },

  /**
   * Gets either the French or English translation details from an object,
   * or null.
   *
   * @param language either 'en' or 'fr'
   * @param obj the object to get the details from.
   * @return the French or English details of the object, or null.
   */
  getTranslatedDetails(language, obj) {
    if (language === 'en') {
      return this.getEnglishDetails(obj);
    } else if (language === 'fr') {
      return this.getFrenchDetails(obj);
    } else {
      return null;
    }
  },
}
