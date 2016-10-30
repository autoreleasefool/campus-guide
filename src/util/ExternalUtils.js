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
 * @created 2016-10-30
 * @file ExternalUtils.js
 * @providesModule ExternalUtils
 * @description Defines a set of methods for interacting with elements outside of the application.
 *
 * @flow
 */
'use strict';

// Imports
const TextUtils = require('TextUtils');

/**
 * Opens a URL if the URL is valid.
 *
 * @param {?string} url         URL to open.
 * @param {Object} Translations translations in the current language of certain text.
 * @param {Object} Linking      an instance of the React Native Linking class.
 * @param {Object} Alert        an instance of the React Native Alert class.
 * @param {Object} Clipboard    an instance of the React Native Clipboard class.
 * @returns {Promise<void>} a promise indicating the result of whether the link was opened
 */
export function openLink(url: ?string,
                         Translations: Object,
                         Linking: Object,
                         Alert: Object,
                         Clipboard: Object): Promise < void > {
  const formattedUrl = TextUtils.formatLink(url);

  return Linking.canOpenURL(url)
      .then((supported: boolean) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Alert.alert(
            Translations.cannot_open_url,
            formattedUrl,
            [
              {text: Translations.cancel, style: 'cancel'},
              {text: Translations.copy_link, onPress: () => Clipboard.setString(formattedUrl)},
            ],
          );
        }
      })
      .catch((err: any) => console.error('An error occurred opening the link.', err));
}
