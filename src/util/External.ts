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
 * @file External.ts
 * @description Defines a set of methods for interacting with elements outside of the application.
 */
'use strict';

// Imports
import * as Translations from './Translations';

/**
 * Opens a URL if the URL is valid.
 *
 * @param {string|undefined} url       URL to open
 * @param {any}              Linking   an instance of the React Native Linking class
 * @param {any}              Alert     an instance of the React Native Alert class
 * @param {any}              Clipboard an instance of the React Native Clipboard class
 * @param {any}              TextUtils an instance of the TextUtils utility class
 * @returns {Promise<void>} a promise indicating the result of whether the link was opened
 */
export async function openLink(url: string | undefined,
                               Linking: any,
                               Alert: any,
                               Clipboard: any,
                               TextUtils: any): Promise<void> {
  const formattedUrl = TextUtils.formatLink(url);
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    Linking.openURL(url);
  } else {
    Alert.alert(
      Translations.get('cannot_open_url'),
      formattedUrl,
      [
        { text: Translations.get('cancel'), style: 'cancel' },
        {
          onPress: (): void => Clipboard.setString(formattedUrl),
          text: Translations.get('copy_link'),
        },
      ]
    );
  }
}

/**
 * Prompt user to open a mailing app to send an email.
 *
 * @param {string}           recipient intended receiver of the email
 * @param {string|undefined} subject   subject of the email
 * @param {string|undefined} body      body of the email
 * @param {any}              Linking   an instance of the React Native Linking class
 * @param {any}              Alert     an instance of the React Native Alert class
 * @param {any}              Clipboard an instance of the React Native Clipboard class
 * @param {any}              TextUtils an instance of the TextUtils utility class
 * @returns {Promise<void>} a promise indicating the result of whether the link was opened
 */
export async function sendEmail(recipient: string,
                                subject: string | undefined,
                                body: string | undefined,
                                Linking: any,
                                Alert: any,
                                Clipboard: any,
                                TextUtils: any): Promise<void> {
  let url = `mailto:${recipient}`;
  if (subject || body) {
    url += `?`;
  }

  if (subject) {
    url += `subject=${subject}`;
  }

  if (body) {
    url += `${subject ? '&' : ''}body=${body}`;
  }

  await openLink(url, Linking, Alert, Clipboard, TextUtils);
}

/**
 * Gets a link to use in place of a missing link.
 *
 * @returns {string} a default link
 */
export function getDefaultLink(): string {
  return 'https://google.ca';
}
