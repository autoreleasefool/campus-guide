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
 * @file ExternalUtils_testLinks.js
 * @description Tests opening links in the external browser.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../ExternalUtils');

// An example valid URL to open.
const exampleURL = 'http://google.com';
// An example valid telephone number to open.
const exampleTelephone = 'tel:1235556789';
// An example valid shortened telephone number to open.
const exampleShortTelephone = 'tel:123';
// An example valid email to open.
const exampleEmail = 'mailto:google@google.com';
// An example of an invalid URL.
const invalidURL = 'thisisnotavalidURL';

// Mock various modules required in testing.
jest.setMock('Alert', {
      alert: jest.fn((title, body, options) => {}),
    })
    .setMock('Clipboard', {
      setString: jest.fn((url) => {}),
    })
    .setMock('Linking', {
      canOpenURL: jest.fn(async (url) => {
        return url !== invalidURL;
      }),
      openURL: jest.fn((url) => {}),
    });

const Alert = require('Alert');
const Clipboard = require('Clipboard');
const Linking = require('Linking');

describe('testLinks', () => {

  it('tests that links are formatted before opening.', () => {
    const ExternalUtils = require('../ExternalUtils');
    const TextUtils = require('../TextUtils');
    const Translations = require('../../../assets/static/js/Translations.en.js');

    ExternalUtils.openLink(exampleURL, Translations, Linking, Alert, Clipboard);
    expect(TextUtils.formatLink).toBeCalledWith(exampleURL);

    ExternalUtils.openLink(exampleTelephone, Translations, Linking, Alert, Clipboard);
    expect(TextUtils.formatLink).toBeCalledWith(exampleTelephone);

    ExternalUtils.openLink(exampleShortTelephone, Translations, Linking, Alert, Clipboard);
    expect(TextUtils.formatLink).toBeCalledWith(exampleShortTelephone);

    ExternalUtils.openLink(exampleEmail, Translations, Linking, Alert, Clipboard);
    expect(TextUtils.formatLink).toBeCalledWith(exampleEmail);
  });

  pit('tests that invalid links are not opened.', () => {
    const ExternalUtils = require('../ExternalUtils');
    const TextUtils = require('../TextUtils');
    const Translations = require('../../../assets/static/js/Translations.en.js');

    return ExternalUtils.openLink(invalidURL, Translations, Linking, Alert, Clipboard)
        .then(() => {
          expect(Alert.alert).toBeCalled();
        });
  });
});
