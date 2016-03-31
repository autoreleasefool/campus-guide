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
  },

  /*
   * Pads the beginning of a string with a character until it is of desiredLength. If no character is
   * provided, pads with spaces.
   */
   leftPad(text, desiredLength, char) {
     if (!char) {
       char = ' ';
     }

     while (text.length < desiredLength) {
       text = char + text;
     }

     return text;
   }

};
