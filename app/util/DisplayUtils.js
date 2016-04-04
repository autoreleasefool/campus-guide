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

  /*
   * Returns the icon and class for an icon to use for the iOS platform, defined in the object.
   */
  getIOSIcon(obj) {
    if ('ios' in obj && 'icon' in obj['ios'] && 'iconClass' in obj['ios']) {
      return {icon: obj.ios.icon, iconClass: obj.ios.iconClass};
    } else if ('icon' in obj && 'iconClass' in obj) {
      return {icon: obj.icon, iconClass: obj.iconClass};
    } else {
      return null;
    }
  },

  /*
   * Returns the icon and class for an icon to use for the Android platform, defined in the object.
   */
  getAndroidIcon(obj) {
    if ('ios' in obj && 'icon' in obj['ios'] && 'iconClass' in obj['ios']) {
      return {icon: obj.ios.icon, iconClass: obj.ios.iconClass};
    } else if ('icon' in obj && 'iconClass' in obj) {
      return {icon: obj.icon, iconClass: obj.iconClass};
    } else {
      return null;
    }
  },

  /*
   * Returns the icon and class defined for an object, for the platform specified.
   * Platform should be 'ios' or 'Android'.
   */
  getPlatformIcon(platform, obj) {
    if (platform === 'ios') {
      return this.getIOSIcon(obj);
    } else if (platform === 'android') {
      return this.getAndroidIcon(obj);
    } else {
      return null;
    }
  },
};
