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
 * DisplayUtils.js
 *
 * @description
 * Defines a set of methods to manipulate the display and related values.
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
   * Returns true if a hexadecimal color is 'dark', false otherwise.
   *
   * @param color a hexadecimal string
   * @return {true} if the color is dark, {false} otherwise.
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

  /**
   * Returns the icon and class for an icon to use for the iOS platform,
   * defined in the object.
   *
   * @param obj the object with either 'ios.icon' and 'ios.iconClass'
   *            properties, or 'icon' and 'iconClass' properties.
   * @return an object with 'icon' and 'iconClass' properties, or null.
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

  /**
   * Returns the icon and class for an icon to use for the Android platform,
   * defined in the object.
   *
   * @param obj the object with either 'android.icon' and 'android.iconClass'
   *            properties, or 'icon' and 'iconClass' properties.
   * @return an object with 'icon' and 'iconClass' properties, or null.
   */
  getAndroidIcon(obj) {
    if ('android' in obj && 'icon' in obj['android'] && 'iconClass' in obj['android']) {
      return {icon: obj.android.icon, iconClass: obj.android.iconClass};
    } else if ('icon' in obj && 'iconClass' in obj) {
      return {icon: obj.icon, iconClass: obj.iconClass};
    } else {
      return null;
    }
  },

  /**
   * Returns the icon and class defined for an object, for the platform specified.
   * Platform should be 'ios' or 'android'.
   *
   * @param platform either 'ios' or 'android'.
   * @param obj      the object with either '{platform}.icon' and
   *                 '{platform}.iconClass' properties, or 'icon' and
   *                 'iconClass' properties.
   * @return an object with 'icon' and 'iconClass' properties, or null.
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

  /**
   * Returns the icon name for certain social media platforms.
   *
   * @param socialMedia a string containing the name of a social media platform.
   * @return the icon of the provided social media platform, or a generic icon.
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

  /**
   * Returns a color for the icon for certain social media platforms.
   *
   * @param socialMedia a string containing the name of a social media platform.
   * @return the color for the icon of the provided social media platform,
   *         or a generic color.
   */
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
