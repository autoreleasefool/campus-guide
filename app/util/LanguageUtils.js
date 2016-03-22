'use strict';

module.exports = {
  /*
   * Gets the French name of an object, or returns the default name. If neither is available, returns null.
   */
  getFrenchName(obj) {
    if ('name_fr' in obj) {
      return obj['name_fr'];
    } else if ('name' in obj) {
      return obj['name'];
    } else {
      return null;
    }
  },

  /*
   * Gets the English name of an object, or returns the default name. If neither is available, returns null.
   */
  getEnglishName(obj) {
    if ('name_en' in obj) {
      return obj['name_en'];
    } else if ('name' in obj) {
      return obj['name'];
    } else {
      return null;
    }
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
  }
}
