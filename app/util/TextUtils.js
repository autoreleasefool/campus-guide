/*************************************************************************
 *
 * @license
 *
 * Copyright 2016 Joseph Roque
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
 *************************************************************************
 *
 * @file
 * TextUtils.js
 *
 * @description
 * Defines a set of methods to manipulate strings.
 *
 * @author
 * Joseph Roque
 *
 *************************************************************************
 *
 * @external
 * @flow
 *
 ************************************************************************/
'use strict';

module.exports = {

  /**
   * If text length is greater than {maxLength}, the text is shortened to
   * maxLength - 2 and 2 periods are added to the end of the text.
   *
   * @param text      string to shorten if too long.
   * @param maxLength maximum length string to return.
   * @return a string with a max length of {maxLength}.
   */
  getTextWithEllipses(text, maxLength) {
    if (text.length > maxLength) {
      return text.substr(0, maxLength - 2) + '..';
    } else {
      return text;
    }
  },

  /**
   * Pads the beginning of a string with a character until it is of
   * {desiredLength}. If no character is provided, pads with spaces.
   *
   * @param text          string to pad.
   * @param desiredLength length of string to return.
   * @param char          optional argument. Character to pad with.
   *                      Uses ' ' by default.
   * @return a string with at least a length of {desiredLength}.
   */
  leftPad(text, desiredLength, char) {
    if (!char) {
      char = ' ';
    }

    while (text.length < desiredLength) {
      text = char + text;
    }

    return text;
  },

  /**
   * Formats certain link formats to display.
   *
   * @param link link to format. Accepted formats are 'tel:\d+', 'mailto:.*'.
   * @return a link which is better for display, or the original.
   */
  formatLink(link) {
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
   * If a time has an hour greater than 23, it is adjusted to be within 24
   * hours.
   *
   * @param time time to convert, in '00:00' format.
   * @return a time between 00:00 and 23:59.
   */
  _get24HourAdjustedTime(time) {
    let hours = parseInt(time.substring(0, 2));
    let minutes = time.substring(3, 5);
    if (hours > 23) {
      hours = hours - 24;
    }

    return TextUtils.leftPad(hours.toString(), 2, '0') + ':' + minutes;
  }
};
