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
 * @created 2016-11-1
 * @file External-test.ts
 * @description Tests the interaction of the application with external mediums.
 *
 */
'use strict';

// Require modules used in testing
import * as External from '../External';

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
  canOpenURL: jest.fn((url: string): Promise<boolean> => {
    if (url === exceptionURL) {
      return Promise.reject('This error is being thrown for testing purposes.');
    } else {
      return Promise.resolve(url !== invalidURL);
    }
  }),
  openURL: jest.fn(),
};

const TextUtils = {
  formatLink: jest.fn((url: string): string => {
    return url;
  }),
};

describe('External-test', () => {

  beforeEach(() => {
    Alert.alert.mockClear();
    Clipboard.setString.mockClear();
    Linking.canOpenURL.mockClear();
    Linking.openURL.mockClear();
    TextUtils.formatLink.mockClear();
  });

  it('tests that the proper default link is returned', () => {
    expect(External.getDefaultLink()).toEqual('https://google.ca');
  });

  it('tests that links are formatted before opening.', async() => {
    await External.openLink(exampleURL, Linking, Alert, Clipboard, TextUtils);
    expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleURL);

    await External.openLink(exampleTelephone, Linking, Alert, Clipboard, TextUtils);
    expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleTelephone);

    await External.openLink(exampleShortTelephone, Linking, Alert, Clipboard, TextUtils);
    expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleShortTelephone);

    await External.openLink(exampleEmail, Linking, Alert, Clipboard, TextUtils);
    expect(TextUtils.formatLink).toHaveBeenCalledWith(exampleEmail);

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Clipboard.setString).not.toHaveBeenCalled();
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it('tests that invalid links are not opened.', async() => {
    await External.openLink(invalidURL, Linking, Alert, Clipboard, TextUtils);
    expect(Alert.alert).toHaveBeenCalled();
    expect(Clipboard.setString).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();

    Alert.alert.mock.calls[0][2][1].onPress();
    expect(Clipboard.setString).toHaveBeenCalledWith(invalidURL);
  });

  it('tests that errors in links are handled.', async() => {
    (await expect(async() => await External.openLink(exceptionURL, Linking, Alert, Clipboard, TextUtils)))
        .rejects
        .toThrow();
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(Clipboard.setString).not.toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
