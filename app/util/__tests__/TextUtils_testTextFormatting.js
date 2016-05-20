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
 * @file TextUtils_testTextFormatting.js
 * @description Tests that formatting text in various ways returns the proper values.
 *
 */
'use strict';

/* eslint-disable no-magic-numbers */

// Unmock modules so the real module is used.
jest.unmock('../TextUtils');

describe('testTextFormatting', () => {
  it('tests that left padding a string returns the proper value.', () => {
    const TextUtils = require('../TextUtils');

    expect(TextUtils.leftPad('Hello', 20)).toBe('               Hello');
    expect(TextUtils.leftPad('Goodbye', 5)).toBe('Goodbye');
    expect(TextUtils.leftPad('Hello, world!', 20, 'e')).toBe('eeeeeeeHello, world!');
    expect(TextUtils.leftPad('12345', 10, '0')).toBe('0000012345');
    expect(TextUtils.leftPad('CampusGuide', 10, 'too_long')).toBe('CampusGuide');
  });

  it('tests that concatenating a string with ellipses returns the proper value.', () => {
    const TextUtils = require('../TextUtils');

    expect(TextUtils.getTextWithEllipses('Hello', 20)).toBe('Hello');
    expect(TextUtils.getTextWithEllipses('World', 5)).toBe('World');
    expect(TextUtils.getTextWithEllipses('Canada', 4)).toBe('Ca..');
    expect(TextUtils.getTextWithEllipses('Goodbye', 100)).toBe('Goodbye');
    expect(TextUtils.getTextWithEllipses('CampusGuide', 2)).toBe('..');
    expect(TextUtils.getTextWithEllipses('ReactNative', 1)).toBe('..');
  });
});
