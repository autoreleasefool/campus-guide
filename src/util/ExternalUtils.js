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
 * @created 2016-10-30
 * @file ExternalUtils.js
 * @providesModule ExternalUtils
 * @description Defines a set of methods for interacting with elements outside of the application.
 *
 * @flow
 */
'use strict';

// Types
import type { Language } from 'types';

// Imports
import * as Translations from 'Translations';

/**
 * Opens a URL if the URL is valid.
 *
 * @param {?string} url         URL to open
 * @param {Language} language  user's selected language
 * @param {Object}   Linking   an instance of the React Native Linking class
 * @param {Object}   Alert     an instance of the React Native Alert class
 * @param {Object}   Clipboard an instance of the React Native Clipboard class
 * @param {Object}   TextUtils an instance of the TextUtils utility class
 * @returns {Promise<void>} a promise indicating the result of whether the link was opened
 */
export function openLink(url: ?string,
                         language: Language,
                         Linking: Object,
                         Alert: Object,
                         Clipboard: Object,
                         TextUtils: Object): Promise < void > {
  const formattedUrl = TextUtils.formatLink(url);

  return new Promise((resolve, reject) => {
    Linking.canOpenURL(url)
        .then((supported: boolean) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(
              Translations.get(language, 'cannot_open_url'),
              formattedUrl,
              [
                { text: Translations.get(language, 'cancel'), style: 'cancel' },
                { text: Translations.get(language, 'copy_link'), onPress: () => Clipboard.setString(formattedUrl) },
              ],
            );
          }
          resolve();
        })
        .catch((err: any) => reject('An error occurred opening the link.', err));
  });
}

/**
 * Gets a link to use in place of a missing link.
 *
 * @returns {string} a default link
 */
export function getDefaultLink(): string {
  return 'https://google.ca';
}

/**
 * Calculates the distance between two coordinates.
 *
 * @param {number} lat1 latitude of first point
 * @param {number} lon1 longitude of first point
 * @param {number} lat2 latitude of second point
 * @param {number} lon2 longitude of second point
 * @returns {number} the distance between the coordinates, in kilometres
 */
export function getDistanceBetweenCoordinates(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
      + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2))
      * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts a number in degrees to radians.
 *
 * @param {number} deg degrees to convert
 * @returns {number} degrees in radians
 */
function deg2rad(deg: number): number {
  const RAD_RATIO = 180;
  return deg * (Math.PI / RAD_RATIO);
}
