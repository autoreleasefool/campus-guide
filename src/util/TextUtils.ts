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
 * @created 2016-10-30
 * @file TextUtils.ts
 * @description Defines a set of methods to manipulate strings.
 */
'use strict';

/* tslint:disable no-magic-numbers */

// Imports
import moment from 'moment';
import * as Constants from '../constants';

import { TimeFormat } from '../../typings/global';
import { Destination } from '../../typings/university';

/**
 * Converts a time to either a 12h or 24h format. If the time is already in the format specified,
 * then it is returned. If the time is invalid, an error is thrown.
 *
 * @param {TimeFormat} format either '12h' or '24h'
 * @param {string} time       the time to convert
 * @returns {string} the converted time, with 'am' or 'pm' suffix for 12h time format
 */
export function convertTimeFormat(format: TimeFormat, time: string): string {
  if (format !== '12h' && format !== '24h') {
    throw new Error(`Invalid format argument: ${format}`);
  }

  if (/^([0-1][0-9]|2[0-4]):[0-5][0-9]$/.test(time)) {
    if (format === '24h') {
      return time;
    }

    return moment(time, 'HH:mm').format('h:mm a');
  } else if (/^([1-9]|1[0-2]):[0-5][0-9] ?[ap]\.?m\.?$/i.test(time)) {
    if (format === '12h') {
      return time.toLowerCase().replace(/[.]/g, '');
    }

    return moment(time, 'h:mm a')
        .format('HH:mm')
        .toLowerCase()
        .replace(/[.]/g, '');
  } else {
    throw new Error(`Invalid time format: ${time}`);
  }
}

/**
 * Returns the string representation of a destination.
 *
 * @param {Destination} destination the destination to stringify
 * @returns {string} the string representation
 */
export function destinationToString(destination: Destination): string {
  if (destination.room == undefined) {
    return `${destination.shorthand}`;
  } else {
    return `${destination.shorthand} ${destination.room}`;
  }
}

/**
 * Formats certain link formats to display.
 *
 * @param {string | undefined} link link to format. Accepted formats are 'tel:\d+', 'mailto:.*'
 * @returns {string} a link which is better for display, or the original
 */
export function formatLink(link: string | undefined): string {
  if (link == undefined) {
    return '';
  }

  if (link.indexOf('tel:') === 0) {
    if (link.length === 14) {
      return `(${link.substr(4, 3)}) ${link.substr(7, 3)}-${link.substr(10, 4)}`;
    } else {
      return link.substring(4);
    }
  } else if (link.indexOf('mailto:') === 0) {
    const questionMark = link.indexOf('?');
    if (questionMark >= 0) {
      return link.substring(7, questionMark);
    } else {
      return link.substring(7);
    }
  } else {
    return link;
  }
}

/**
 * If a time has an hour greater than 23, it is adjusted to be within 24 hours.
 *
 * @param {string} time time to convert, in '00:00' format
 * @returns {string} a time between 00:00 and 23:59
 */
export function get24HourAdjustedTime(time: string): string {
  const minutes = time.substring(3, 5);
  let hours = parseInt(time.substring(0, 2));
  if (hours > 23) {
    hours -= 24;
  }

  return `${leftPad(hours.toString(), 2, '0')}:${minutes}`;
}

/**
 * Converts a number of minutes since midnight to a string.
 *
 * @param {number}     minutesSinceMidnight minutes since midnight
 * @param {TimeFormat} format               specify a format to return
 * @returns {string} Returns a string of the format '1:00 pm' in 12 hour time or
 *                   '13:00' in 24 hour time.
 */
export function getFormattedTimeSinceMidnight(
    minutesSinceMidnight: number,
    format: TimeFormat): string {
  const hours = Math.floor(minutesSinceMidnight / Constants.Time.MINUTES_IN_HOUR);
  const minutes = minutesSinceMidnight - (hours * Constants.Time.MINUTES_IN_HOUR);
  const timeString = `${hours >= Constants.Time.HOURS_UNDER_PREFIXED ? '' : '0'}${hours}:`
      + `${minutes >= Constants.Time.MINUTES_UNDER_PREFIXED ? '' : '0'}${minutes}`;

  return convertTimeFormat(format, timeString);
}

/**
 * If text length is greater than {maxLength}, the text is shortened to maxLength - 2 and 2 periods are added to the
 * end of the text.
 *
 * @param {string} text      string to shorten if too long
 * @param {number} maxLength maximum length string to return
 * @returns {string} a string with a max length of {maxLength}
 */
export function getTextWithEllipses(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return `${text.substr(0, Math.max(maxLength - 2, 0))}..`;
  } else {
    return text;
  }
}

/**
 * Pads the beginning of a string with a character until it is of {desiredLength}. If no character is provided,
 * pads with spaces.
 *
 * @param {string}           text          string to pad
 * @param {number}           desiredLength length of string to return
 * @param {string|undefined} char          optional argument. Character to pad with. Uses ' ' by default
 * @returns {string} a string with at least a length of {desiredLength}
 */
export function leftPad(text: string, desiredLength: number, char: string | undefined): string {
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
}
