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
 * @file TextUtils-test.js
 * @description Tests text formatting and adjustments.
 *
 */
'use strict';

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
// An example valid long email to open.
const exampleLongEmail = 'mailto:google@google.com?subject=Test';
// An example valid formatted email to display.
const exampleFormattedEmail = 'google@google.com';
// An example of an invalid URL.
const invalidURL = 'thisIsNotAValidURL';

// A dictionary of time values, with their expected formatting in 24 hour adjusted time.
const expectedTimeFormats = {
  '10:20': '10:20',
  '14:08': '14:08',
  '36:11': '12:11',
  '18:45': '18:45',
  '02:50': '02:50',
  '25:19': '01:19',
  '28:30': '04:30',
};

// Require modules for testing
import * as TextUtils from '../TextUtils';

// Add the String.format function
if (!String.format) {
  String.format = function format(str: string) {
    const args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/{(\d+)}/g, (match, number) => {
      return typeof args[number] == 'undefined'
        ? match
        : args[number];
    });
  };
}

describe('TextUtils-test', () => {

  it('tests converting time formats with invalid params', () => {
    const invalidTime = 'not a time';
    const invalidFormat = '00';
    expect(() => TextUtils.convertTimeFormat('12h', invalidTime)).toThrow();
    expect(() => TextUtils.convertTimeFormat(invalidFormat, '12:00')).toThrow();
  });

  it('tests converting to a 12h time format', () => {
    expect(TextUtils.convertTimeFormat('12h', '12:00 am')).toBe('12:00 am');
    expect(TextUtils.convertTimeFormat('12h', '12:00 a.m.')).toBe('12:00 am');
    expect(TextUtils.convertTimeFormat('12h', '12:00 AM')).toBe('12:00 am');
    expect(TextUtils.convertTimeFormat('12h', '12:00 A.M.')).toBe('12:00 am');
    expect(TextUtils.convertTimeFormat('12h', '00:00')).toBe('12:00 am');
    expect(TextUtils.convertTimeFormat('12h', '23:59')).toBe('11:59 pm');
    expect(TextUtils.convertTimeFormat('12h', '06:00')).toBe('6:00 am');
    expect(TextUtils.convertTimeFormat('12h', '12:00')).toBe('12:00 pm');
    expect(TextUtils.convertTimeFormat('12h', '18:00')).toBe('6:00 pm');
  });

  it('tests converting to a 24h time format', () => {
    expect(TextUtils.convertTimeFormat('24h', '23:59')).toBe('23:59');
    expect(TextUtils.convertTimeFormat('24h', '6:00 am')).toBe('06:00');
    expect(TextUtils.convertTimeFormat('24h', '11:59 pm')).toBe('23:59');
    expect(TextUtils.convertTimeFormat('24h', '11:59 p.m.')).toBe('23:59');
    expect(TextUtils.convertTimeFormat('24h', '11:59 PM')).toBe('23:59');
    expect(TextUtils.convertTimeFormat('24h', '11:59 P.M.')).toBe('23:59');
    expect(TextUtils.convertTimeFormat('24h', '12:00 am')).toBe('00:00');
    expect(TextUtils.convertTimeFormat('24h', '12:00 a.m.')).toBe('00:00');
    expect(TextUtils.convertTimeFormat('24h', '12:00 AM')).toBe('00:00');
    expect(TextUtils.convertTimeFormat('24h', '12:00 A.M.')).toBe('00:00');
  });

  it('tests that formatting a link returns the proper value.', () => {
    expect(TextUtils.formatLink(exampleURL)).toBe(exampleURL);
    expect(TextUtils.formatLink(exampleTelephone)).toBe(exampleFormattedTelephone);
    expect(TextUtils.formatLink(exampleShortTelephone)).toBe(exampleShortFormattedTelephone);
    expect(TextUtils.formatLink(exampleEmail)).toBe(exampleFormattedEmail);
    expect(TextUtils.formatLink(exampleLongEmail)).toBe(exampleFormattedEmail);
    expect(TextUtils.formatLink(invalidURL)).toBe(invalidURL);
    expect(TextUtils.formatLink('')).toBe('');
    expect(TextUtils.formatLink(null)).toBe('');
  });

  it('tests that left padding a string returns the proper value.', () => {

    /* Magic numbers are used here for simplicity's sake */
    /* eslint-disable no-magic-numbers */
    expect(TextUtils.leftPad('Hello', 20)).toBe('               Hello');
    expect(TextUtils.leftPad('Goodbye', 5)).toBe('Goodbye');
    expect(TextUtils.leftPad('Hello, world!', 20, 'e')).toBe('eeeeeeeHello, world!');
    expect(TextUtils.leftPad('12345', 10, '0')).toBe('0000012345');
    expect(TextUtils.leftPad('CampusGuide', 10, 'too_long')).toBe('CampusGuide');

    /* eslint-enable no-magic-numbers */

  });

  it('tests that concatenating a string with ellipses returns the proper value.', () => {

    /* Magic numbers are used here for simplicity's sake */
    /* eslint-disable no-magic-numbers */
    expect(TextUtils.getTextWithEllipses('Hello', 20)).toBe('Hello');
    expect(TextUtils.getTextWithEllipses('World', 5)).toBe('World');
    expect(TextUtils.getTextWithEllipses('Canada', 4)).toBe('Ca..');
    expect(TextUtils.getTextWithEllipses('Goodbye', 100)).toBe('Goodbye');
    expect(TextUtils.getTextWithEllipses('CampusGuide', 2)).toBe('..');
    expect(TextUtils.getTextWithEllipses('ReactNative', 1)).toBe('..');

    /* eslint-enable no-magic-numbers */

  });

  it('tests getting a 24 hour adjusted time works', () => {
    for (const time in expectedTimeFormats) {
      if (expectedTimeFormats.hasOwnProperty(time)) {
        expect(TextUtils.get24HourAdjustedTime(time)).toBe(expectedTimeFormats[time]);
      }
    }
  });
});
