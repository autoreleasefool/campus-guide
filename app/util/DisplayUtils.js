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
 * @file DisplayUtils.js
 * @description Defines a set of methods to manipulate the display and related values.
 * @flow
 *
 */
'use strict';

// Import type definition icons.
import type {
  DefaultIcon,
  IconObject,
  PlatformString,
} from '../Types';

module.exports = {

  /**
   * Returns the icon and class for an icon to use for the Android platform,
   * defined in the object.
   *
   * @param {Object} obj the object with either 'icon.android.name' and 'icon.android.class'
   *                     properties, or 'icon.name' and 'icon.class' properties.
   * @returns {?DefaultIcon} an object with 'name' and 'class' properties, or null.
   */
  getAndroidIcon(obj: Object): ?DefaultIcon {
    if ('icon' in obj) {
      const icon: IconObject = obj.icon;
      if (icon.android != null) {
        return {name: icon.android.name, class: icon.android.class};
      } else if (icon.name != null && icon.class != null) {
        return {name: icon.name, class: icon.class};
      }
    }

    return null;
  },

  /**
   * Returns the icon and class for an icon to use for the iOS platform,
   * defined in the object.
   *
   * @param {Object} obj the object with either 'icon.ios.name' and 'icon.ios.class'
   *                     properties, or 'icon.name' and 'icon.class' properties.
   * @returns {?DefaultIcon} an object with 'name' and 'class' properties, or null.
   */
  getIOSIcon(obj: Object): ?DefaultIcon {
    if ('icon' in obj) {
      const icon: IconObject = obj.icon;
      if (icon.ios != null) {
        return {name: icon.ios.name, class: icon.ios.class};
      } else if (icon.name != null && icon.class != null) {
        return {name: icon.name, class: icon.class};
      }
    }

    return null;
  },

  /**
   * Returns the icon and class defined for an object, for the platform specified.
   * Platform should be 'ios' or 'android'.
   *
   * @param {PlatformString} platform either 'ios' or 'android'.
   * @param {Object} obj              the object with either 'icon.{platform}.name' and
   *                                  'icon.{platform}.class' properties, or 'icon.name' and
   *                                  'icon.class' properties.
   * @returns {?DefaultIcon} an object with 'name' and 'class' properties, or null.
   */
  getPlatformIcon(platform: PlatformString, obj: Object): ?DefaultIcon {
    if (platform === 'ios') {
      return this.getIOSIcon(obj);
    } else if (platform === 'android') {
      return this.getAndroidIcon(obj);
    } else {
      return null;
    }
  },

  /**
   * Returns a color for the icon for certain social media platforms.
   *
   * @param {string} socialMedia a string containing the name of a social media platform.
   * @returns {string} the color for the icon of the provided social media platform,
   *         or a generic color.
   */
  getSocialMediaIconColor(socialMedia: string): string {
    switch (socialMedia.toLowerCase()) {
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

  /**
   * Returns the icon name for certain social media platforms.
   *
   * @param {string} socialMedia a string containing the name of a social media platform.
   * @returns {string} the icon of the provided social media platform, or a generic icon.
   */
  getSocialMediaIconName(socialMedia: string): string {
    switch (socialMedia.toLowerCase()) {
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
   * Returns true if a hexadecimal color is 'dark', false otherwise.
   *
   * @param {string} color a hexadecimal string
   * @returns {boolean} true if the color is dark, false otherwise.
   */
  isColorDark(color: string): boolean {
    // Base value for hexadecimal
    const HEX_BASE: number = 16;

    // Bit shift values for color parts
    const RED_BIT_SHIFT: number = 16;
    const GREEN_BIT_SHIFT: number = 8;

    // Hexedemical value to extract bits pertaining to certain colors
    const RED_HEX: number = 0xff0000;
    const GREEN_HEX: number = 0xff00;
    const BLUE_HEX: number = 0xff;

    // Threshold values for what is light and dark in a color
    const RED_THRESHOLD: number = 0.299;
    const GREEN_THRESHOLD: number = 0.587;
    const BLUE_THRESHOLD: number = 0.114;

    // Possible value range for colors
    const COLOR_RANGE: number = 256;

    // Light vs dark range
    const LIGHT_DARK_SPLIT: number = 0.5;

    let hexColor: number = 0;
    if (color.indexOf('#') == 0) {
      hexColor = parseInt(color.substring(1, color.length), HEX_BASE);
    } else {
      hexColor = parseInt(color, HEX_BASE);
    }

    const r: number = (hexColor & RED_HEX) >> RED_BIT_SHIFT;
    const g: number = (hexColor & GREEN_HEX) >> GREEN_BIT_SHIFT;
    const b: number = (hexColor & BLUE_HEX);

    return ((r * RED_THRESHOLD + g * GREEN_THRESHOLD + b * BLUE_THRESHOLD) / COLOR_RANGE < LIGHT_DARK_SPLIT);
  },
};
