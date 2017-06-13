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
 * @file ExternalUtils.ts
 * @providesModule ExternalUtils
 * @description Defines a set of methods for interacting with elements outside of the application.
 */
'use strict';

// Imports
import * as Translations from 'Translations';

/**
 * Opens a URL if the URL is valid.
 *
 * @param {string|undefined} url       URL to open
 * @param {Language}         language  user's selected language
 * @param {object}           Linking   an instance of the React Native Linking class
 * @param {object}           Alert     an instance of the React Native Alert class
 * @param {object}           Clipboard an instance of the React Native Clipboard class
 * @param {object}           TextUtils an instance of the TextUtils utility class
 * @returns {Promise<void>} a promise indicating the result of whether the link was opened
 */
export function openLink(url: string | undefined,
                         language: Language,
                         Linking: object,
                         Alert: object,
                         Clipboard: object,
                         TextUtils: object): Promise < void > {
  const formattedUrl = TextUtils.formatLink(url);

  return new Promise((resolve: (r: any) => void, reject: (e: any) => void): void => {
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
                {
                  onPress: (): void => Clipboard.setString(formattedUrl),
                  text: Translations.get(language, 'copy_link'),
                },
              ]
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
