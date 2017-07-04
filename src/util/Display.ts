/**
 *
 * @license
 * Copyright (C) 2016-2017 Joseph Roque
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
 * @created 2016-10-17
 * @file Display.ts
 * @description Defines a set of methods to manipulate the display and related values.
 */
'use strict';

import { PlatformOSType } from 'react-native';
import { BasicIcon } from '../../typings/global';
import { Facility } from '../../typings/university';

/**
 * Returns the icon and class for an icon to use for the Android platform, defined in the object.
 *
 * @param {any} obj the object with either 'icon.android.name' and 'icon.android.class' properties, or
 *                     'icon.name' and 'icon.class' properties.
 * @returns {Icon|undefined} an object with 'name' and 'class' properties, or undefined
 */
export function getAndroidIcon(obj: any): BasicIcon | undefined {
  if ('icon' in obj) {
    const icon = obj.icon;
    if (('android' in icon) && ('name' in icon.android) && ('class' in icon.android)) {
      return { name: icon.android.name, class: icon.android.class };
    } else if (('name' in icon) && ('class' in icon)) {
      return { name: icon.name, class: icon.class };
    }
  }

  return undefined;
}

/**
 * Returns the icon class to represent a provided facility.
 *
 * @param {Facility} facility the identifier of the facility
 * @returns {string|undefined} a string with the class of the icon, or undefined
 */
export function getFacilityIconClass(facility: Facility): string | undefined {
  switch (facility) {
    case 'atm':
    case 'food':
    case 'printer':
    case 'store':
    case 'bed':
    case 'alcohol':
    case 'laundry':
    case 'library':
    case 'parking':
    case 'mail':
    case 'pharmacy':
    case 'gym':
    case 'pool':
      return 'material';
    default:
      return undefined;
  }
}

/**
 * Returns the icon name to represent a provided facility.
 *
 * @param {Facility} facility the identifier of the facility
 * @returns {string|undefined} a string with the name of the icon, or undefined
 */
export function getFacilityIconName(facility: Facility): string | undefined {
  switch (facility) {
    case 'atm':
      return 'local-atm';
    case 'food':
      return 'local-dining';
    case 'printer':
      return 'local-printshop';
    case 'store':
      return 'local-convenience-store';
    case 'bed':
      return 'hotel';
    case 'alcohol':
      return 'local-bar';
    case 'laundry':
      return 'local-laundry-service';
    case 'library':
      return 'local-library';
    case 'parking':
      return 'local-parking';
    case 'mail':
      return 'local-post-office';
    case 'pharmacy':
      return 'local-pharmacy';
    case 'gym':
      return 'fitness-center';
    case 'pool':
      return 'pool';
    default:
      return undefined;
  }
}

/**
 * Returns the icon and class for an icon to use for the iOS platform,
 * defined in the object.
 *
 * @param {any} obj the object with either 'icon.ios.name' and 'icon.ios.class' properties, or 'icon.name' and
 *                     'icon.class' properties.
 * @returns {Icon|undefined} an object with 'name' and 'class' properties, or undefined
 */
export function getIOSIcon(obj: any): BasicIcon | undefined {
  if ('icon' in obj) {
    const icon = obj.icon;
    if (('ios' in icon) && ('name' in icon.ios) && ('class' in icon.ios)) {
      return { name: icon.ios.name, class: icon.ios.class };
    } else if (('name' in icon) && ('class' in icon)) {
      return { name: icon.name, class: icon.class };
    }
  }

  return undefined;
}

/**
 * Returns the icon and class defined for an object, for the platform specified. Platform should be 'ios' or
 * 'android'.
 *
 * @param {PlatformOSType} platform either 'ios' or 'android'.
 * @param {any}            obj      the object with either 'icon.{platform}.name' and 'icon.{platform}.class'
 *                                  properties, or 'icon.name' and 'icon.class' properties.
 * @returns {BasicIcon|undefined} an object with 'name' and 'class' properties, or undefined
 */
export function getPlatformIcon(platform: PlatformOSType, obj: any): BasicIcon | undefined {
  switch (platform) {
    case 'ios':
      return getIOSIcon(obj);
    case 'android':
      return getAndroidIcon(obj);
    default:
      return undefined;
  }
}

/**
 * Returns a color for the icon for certain social media platforms.
 *
 * @param {string} socialMedia a string containing the name of a social media platform
 * @returns {string} the color for the icon of the provided social media platform, or a generic color
 */
export function getSocialMediaIconColor(socialMedia: string): string {
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
}

/**
 * Returns the icon name for certain social media platforms.
 *
 * @param {string} socialMedia a string containing the name of a social media platform
 * @returns {string} the icon of the provided social media platform, or a generic icon
 */
export function getSocialMediaIconName(socialMedia: string): string {
  switch (socialMedia.toLowerCase()) {
    case 'linkedin':
      return 'logo-linkedin';
    case 'twitter':
      return 'logo-twitter';
    case 'facebook':
      return 'logo-facebook';
    case 'instagram':
      return 'logo-instagram';
    case 'youtube':
      return 'logo-youtube';
    case 'tumblr':
      return 'logo-tumblr';
    default:
      return 'md-open';
  }
}

/**
 * Returns true if a hexadecimal color is 'dark', false otherwise.
 *
 * @param {string} color a hexadecimal string
 * @returns {boolean} true if the color is dark, false otherwise
 */
export function isColorDark(color: string): boolean {
  // Base value for hexadecimal
  const HEX_BASE = 16;

  // Bit shift values for color parts
  const RED_BIT_SHIFT = 16;
  const GREEN_BIT_SHIFT = 8;

  // Hexadecimal value to extract bits pertaining to certain colors
  const RED_HEX = 0xFF0000;
  const GREEN_HEX = 0xFF00;
  const BLUE_HEX = 0xFF;

  // Threshold values for what is light and dark in a color
  const RED_THRESHOLD = 0.299;
  const GREEN_THRESHOLD = 0.587;
  const BLUE_THRESHOLD = 0.114;

  // Possible value range for colors
  const COLOR_RANGE = 256;

  // Light vs dark range
  const LIGHT_DARK_SPLIT = 0.5;

  const hexColor = color.indexOf('#') === 0
      ? parseInt(color.substring(1, color.length), HEX_BASE)
      : parseInt(color, HEX_BASE);

  const r: number = (hexColor & RED_HEX) >> RED_BIT_SHIFT;
  const g: number = (hexColor & GREEN_HEX) >> GREEN_BIT_SHIFT;
  const b: number = (hexColor & BLUE_HEX);

  return ((r * RED_THRESHOLD + g * GREEN_THRESHOLD + b * BLUE_THRESHOLD) / COLOR_RANGE < LIGHT_DARK_SPLIT);
}
