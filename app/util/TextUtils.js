/*
 * Defines a set of methods to manipulate strings.
 */

'use strict';

module.exports = {

  /*
   * If text length is greater than maxLength, the text is shortened to maxLength - 2 and 2 periods are added
   * to the end of the text.
   */
  getTextWithEllipses(text, maxLength) {
    if (text.length > maxLength) {
      return text.substr(0, maxLength - 2) + '..';
    } else {
      return text;
    }
  }
};
