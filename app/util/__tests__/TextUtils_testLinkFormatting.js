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
 * @file TextUtils_testFormattingLinks.js
 * @description Tests that formatting a link returns the proper value.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../TextUtils');

// An example valid URL to open.
const exampleURL = 'http://google.com';
// An example valid telephone number to open.
const exampleTelephone = 'tel:1235556789';
// An example valid formatted telephone number to display.
const exampleFormattedTelephone = '(123) 555-6789';
// An example valid shortened telephone number to open.
const exampleShortTelephone = 'tel:123';
// An example valid formatted shortened telephone number to display.
const exampleShortFormattedTelephone = '123';
// An example valid email to open.
const exampleEmail = 'mailto:google@google.com';
// An example valid formatted email to display.
const exampleFormattedEmail = 'google@google.com';
// An example of an invalid URL.
const invalidURL = 'thisisnotavalidURL';

describe('testFormattingLinks', () => {
  it('tests that formatting a link returns the proper value.', () => {
    const TextUtils = require('../TextUtils');

    expect(TextUtils.formatLink(exampleURL)).toBe(exampleURL);
    expect(TextUtils.formatLink(exampleTelephone)).toBe(exampleFormattedTelephone);
    expect(TextUtils.formatLink(exampleShortTelephone)).toBe(exampleShortFormattedTelephone);
    expect(TextUtils.formatLink(exampleEmail)).toBe(exampleFormattedEmail);
    expect(TextUtils.formatLink(invalidURL)).toBe(invalidURL);
    expect(TextUtils.formatLink('')).toBe('');
    expect(TextUtils.formatLink(null)).toBe('');
  });
});
