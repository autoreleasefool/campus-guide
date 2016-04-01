/*
 * Defines a set of methods to manipulate the display and related values.
 */
'use strict';

module.exports = {

  /*
   * Returns true if a hexadecimal color is 'dark', false otherwise.
   */
  isColorDark(color) {
    if (typeof(color) == 'string') {
      color = parseInt(color.substring(1, color.length), 16);
    }

    let r = (color & 0xff0000) >> 16;
    let g = (color & 0xff00) >> 8;
    let b = (color & 0xff);

    return ((r * 0.299 + g * 0.587 + b * 0.114) / 256 < 0.5);
  },
};
