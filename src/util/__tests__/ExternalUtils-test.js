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
 * @created 2016-11-1
 * @file ExternalUtils-test.js
 * @description Tests the interaction of the application with external mediums.
 *
 */
'use strict';

/* async seems to cause an issue with this rule. */
/* eslint-disable arrow-parens */

// Require modules used in testing
import * as ExternalUtils from '../ExternalUtils';
const Translations = {};

// An example valid URL to open.
const exampleURL = 'https://google.ca';
// An example valid telephone number to open.
const exampleTelephone = 'tel:1235556789';
// An example valid shortened telephone number to open.
const exampleShortTelephone = 'tel:123';
// An example valid email to open.
const exampleEmail = 'mailto:google@google.com';
// An example of an invalid URL.
const invalidURL = 'thisIsNotAValidURL';
// When this URL is requested, an error is thrown.
const exceptionURL = 'throwAnExceptionURL';

const Alert = {
  alert: jest.fn(),
};

const Clipboard = {
  setString: jest.fn(),
};

const Linking = {
  canOpenURL: jest.fn((url) => {

    if (url === exceptionURL) {
      return Promise.reject('This error is being thrown for testing purposes.');
    } else {
      return Promise.resolve(url !== invalidURL);
    }
  }),
  openURL: jest.fn(),
};

const TextUtils = {
  formatLink: jest.fn(url => {
    return url;
  }),
};

describe('ExternalUtils-test', () => {

  beforeEach(() => {
    Alert.alert.mockClear();
    Clipboard.setString.mockClear();
    Linking.canOpenURL.mockClear();
    Linking.openURL.mockClear();
    TextUtils.formatLink.mockClear();
  });

  it('tests that the proper default link is returned', () => {
    expect(ExternalUtils.getDefaultLink()).toEqual('https://google.ca');
  });

  it('tests that links are formatted before opening.', () => {

    return ExternalUtils.openLink(exampleURL, Translations, Linking, Alert, Clipboard, TextUtils)
        .then(() => {
          expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleURL);
          return ExternalUtils.openLink(exampleTelephone, Translations, Linking, Alert, Clipboard, TextUtils);
        })
        .then(() => {
          expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleTelephone);
          return ExternalUtils.openLink(exampleShortTelephone, Translations, Linking, Alert, Clipboard, TextUtils);
        })
        .then(() => {
          expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleShortTelephone);
          return ExternalUtils.openLink(exampleEmail, Translations, Linking, Alert, Clipboard, TextUtils);
        })
        .then(() => {
          expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleEmail);

          expect(Alert.alert).not.toHaveBeenCalled();
          expect(Clipboard.setString).not.toHaveBeenCalled();
          expect(Linking.openURL).toHaveBeenCalled();
        });
  });

  it('tests that invalid links are not opened.', () => {
    return ExternalUtils.openLink(invalidURL, Translations, Linking, Alert, Clipboard, TextUtils)
        .then(() => {
          expect(Alert.alert).toHaveBeenCalled();
          expect(Clipboard.setString).not.toHaveBeenCalled();
          expect(Linking.openURL).not.toHaveBeenCalled();

          Alert.alert.mock.calls[0][2][1].onPress();
          expect(Clipboard.setString).toHaveBeenCalledWith(invalidURL);
        });
  });

  it('tests that errors in links are handled.', () => {
    return ExternalUtils.openLink(exceptionURL, Translations, Linking, Alert, Clipboard, TextUtils)
        .then(() => expect(false).toBeTruthy())
        .catch((err) => {
          console.error('An error was expected to be thrown.', err);
          expect(Alert.alert).not.toHaveBeenCalled();
          expect(Clipboard.setString).not.toHaveBeenCalled();
          expect(Linking.openURL).not.toHaveBeenCalled();
        });
  });

  it('tests that comparing the distance between coordinates works', () => {

    /* eslint-disable no-magic-numbers */
    /* Test: http://andrew.hedges.name/experiments/haversine/ */

    expect(ExternalUtils.getDistanceBetweenCoordinates(0, 0, 0, 0)).toBe(0);
    expect(ExternalUtils.getDistanceBetweenCoordinates(0, 0, 45, 75)).toBeCloseTo(8835, 1);
    expect(ExternalUtils.getDistanceBetweenCoordinates(38.898556, -77.037852, 38.897147, -77.043934))
        .toBeCloseTo(0.549, 1);

    /* eslint-enable no-magic-numbers */

  });

});
