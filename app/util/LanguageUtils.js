/*
 * Defines a set of methods to easily get translations from objects.
 */
'use strict';

module.exports = {

  /*
   * Gets the French variant of a property from an object, or returns the default of the variant. If neither
   * is available, returns null.
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

  /*
   * Gets the English variant of a property from an object, or returns the default of the variant. If neither
   * is available, returns null.
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

  /*
   * Gets the French name of an object, or returns the default name. If neither is available, returns null.
   */
  getFrenchName(obj) {
    return this._getFrenchVariant('name', obj);
  },

  /*
   * Gets the English name of an object, or returns the default name. If neither is available, returns null.
   */
  getEnglishName(obj) {
    return this._getEnglishVariant('name', obj);
  },

  /*
   * Gets the French link of an object, or returns the default link. If neither is available, returns null.
   */
  getFrenchLink(obj) {
    return this._getFrenchVariant('link', obj);
  },

  /*
   * Gets the English link of an object, or returns the default link. If neither is available, returns null.
   */
  getEnglishLink(obj) {
    return this._getEnglishVariant('link', obj);
  },

  /*
   * Gets either the French or English translation name from an object, or null.
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

  /*
   * Gets either the French of English translation link from an object, or null.
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
}
