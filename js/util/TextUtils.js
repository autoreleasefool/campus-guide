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
 * @file TextUtils.js
 * @description Defines a set of methods to manipulate strings.
 *
 * @flow
 */
'use strict';

/* eslint-disable no-magic-numbers */

module.exports = {

  /**
   * Formats certain link formats to display.
   *
   * @param {string} link link to format. Accepted formats are 'tel:\d+', 'mailto:.*'.
   * @returns {string} a link which is better for display, or the original.
   */
  formatLink(link: ?string): string {
    if (link == null) {
      return '';
    }

    if (link.indexOf('tel:') === 0) {
      if (link.length === 14) {
        return '(' + link.substr(4, 3) + ') ' + link.substr(7, 3) + '-' + link.substr(10, 4);
      } else {
        return link.substring(4);
      }
    } else if (link.indexOf('mailto:') === 0) {
      return link.substring(7);
    } else {
      return link;
    }
  },

  /**
   * If a time has an hour greater than 23, it is adjusted to be within 24 hours.
   *
   * @param {string} time time to convert, in '00:00' format.
   * @returns {string} a time between 00:00 and 23:59.
   */
  get24HourAdjustedTime(time: string): string {
    const minutes = time.substring(3, 5);
    let hours = parseInt(time.substring(0, 2));
    if (hours > 23) {
      hours -= 24;
    }

    return this.leftPad(hours.toString(), 2, '0') + ':' + minutes;
  },

  /**
   * If text length is greater than {maxLength}, the text is shortened to maxLength - 2 and 2 periods are added to the
   * end of the text.
   *
   * @param {string} text      string to shorten if too long.
   * @param {number} maxLength maximum length string to return.
   * @returns {string} a string with a max length of {maxLength}.
   */
  getTextWithEllipses(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substr(0, Math.max(maxLength - 2, 0)) + '..';
    } else {
      return text;
    }
  },

  /**
   * Pads the beginning of a string with a character until it is of {desiredLength}. If no character is provided,
   * pads with spaces.
   *
   * @param {string} text          string to pad.
   * @param {number} desiredLength length of string to return.
   * @param {?string} char         optional argument. Character to pad with. Uses ' ' by default.
   * @returns {string} a string with at least a length of {desiredLength}.
   */
  leftPad(text: string, desiredLength: number, char: ?string): string {
    const replacementChar = char || ' ';
    let replacedString = text;
    let replacedStringLength = replacedString.length;

    if (replacementChar.length !== 1) {
      return text;
    }

    while (replacedStringLength < desiredLength) {
      replacedString = replacementChar + replacedString;
      replacedStringLength++;
    }

    return replacedString;
  },
};
