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
      if (color.indexOf('#') == 0) {
        color = parseInt(color.substring(1, color.length), 16);
      } else {
        color = parseInt(color, 16);
      }
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

  /*
   * Returns the icon name for a certain social media platform.
   */
  getSocialMediaIconName(socialMedia) {
    switch(socialMedia.toLowerCase()) {
      case 'linkedin':
        return 'social-linkedin';
      case 'twitter':
        return 'social-twitter';
      case 'facebook':
        return 'social-facebook';
      case 'instagram':
        return 'social-instagram-outline';
      case 'youtube':
        return 'social-youtube';
      case 'tumblr':
        return 'social-tumblr';
      default:
        return 'android-open';
    }
  },

  getSocialMediaIconColor(socialMedia) {
    switch(socialMedia.toLowerCase()) {
      case 'linkedin':
        return '#0077B5';
      case 'twitter':
        return '#55ACEE';
      case 'facebook':
        return '#3D509F';
      case 'instagram':
        return '#241F20';
      case 'youtube':
        return '#CD201F';
      case 'tumblr':
        return '#35465C';
      default:
        return '#000000';
    }
  },
};
