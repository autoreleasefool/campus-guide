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
 * @file ExternalUtils-test.js
 * @description Tests the interaction of the application with external mediums.
 *
 */
'use strict';

/* async seems to cause an issue with this rule. */
/* eslint-disable arrow-parens */

// Unmock modules so the real module is used.
jest.unmock('ExternalUtils');

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
// When this URL is requested, an error is thrown.
const exceptionURL = 'throwAnExceptionURL';

// Mock various modules required in testing.
jest.setMock('Alert', {
  alert: jest.fn(),
});

jest.setMock('Clipboard', {
  setString: jest.fn(),
});

jest.setMock('Linking', {
  canOpenURL: jest.fn(async (url) => {
    if (url === exceptionURL) {
      throw new Error('This error is being thrown for testing purposes.');
    } else {
      return url !== invalidURL;
    }
  }),
  openURL: jest.fn(),
});

jest.setMock('../TextUtils', {
  formatLink: jest.fn(url => url),
});

// Require dummy modules
const Alert = require('Alert');
const Clipboard = require('Clipboard');
const Linking = require('Linking');
const TextUtils = require('TextUtils');

// Require modules used in testing
const ExternalUtils = require('ExternalUtils');
const Translations = {};

describe('ExternalUtils-test', () => {

  beforeEach(() => {
    Alert.alert.mockClear();
    Clipboard.setString.mockClear();
    Linking.canOpenURL.mockClear();
    Linking.openURL.mockClear();
  });

  it('tests that the proper default link is returned', () => {
    expect(ExternalUtils.getDefaultLink()).toEqual('https://google.ca');
  });

  it('tests that links are formatted before opening.', async () => {
    try {
      await ExternalUtils.openLink(exampleURL, Translations, Linking, Alert, Clipboard);
      expect(TextUtils.formatLink).toBeCalledWith(exampleURL);

      await ExternalUtils.openLink(exampleTelephone, Translations, Linking, Alert, Clipboard);
      expect(TextUtils.formatLink).toBeCalledWith(exampleTelephone);

      await ExternalUtils.openLink(exampleShortTelephone, Translations, Linking, Alert, Clipboard);
      expect(TextUtils.formatLink).toBeCalledWith(exampleShortTelephone);

      await ExternalUtils.openLink(exampleEmail, Translations, Linking, Alert, Clipboard);
      expect(TextUtils.formatLink).toBeCalledWith(exampleEmail);

      expect(Alert.alert).not.toBeCalled();
      expect(Clipboard.setString).not.toBeCalled();
      expect(Linking.openURL).toBeCalled();
    } catch (object) {
      console.error('An error should not be thrown.', object);
    }
  });

  it('tests that invalid links are not opened.', async () => {
    try {
      await ExternalUtils.openLink(invalidURL, Translations, Linking, Alert, Clipboard);

      expect(Alert.alert).toBeCalled();
      expect(Clipboard.setString).not.toBeCalled();
      expect(Linking.openURL).not.toBeCalled();

      Alert.alert.mock.calls[0][2][1].onPress();
      expect(Clipboard.setString).toBeCalledWith(invalidURL);
    } catch (object) {
      console.error('An error should not be thrown.', object);
    }
  });

  it('tests that errors in links are handled.', async () => {
    try {
      await ExternalUtils.openLink(exceptionURL, Translations, Linking, Alert, Clipboard);

      expect(Alert.alert).not.toBeCalled();
      expect(Clipboard.setString).not.toBeCalled();
      expect(Linking.openURL).not.toBeCalled();
    } catch (object) {
      console.error('An error should not be thrown.', object);
    }
  });
});
