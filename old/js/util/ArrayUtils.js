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
 * @file ArrayUtils.js
 * @description Defines a set of methods to manipulate arrays.
 *
 * @flow
 */

/**
 * Search an array of objects for one that has a key {key} with a value that matches {value}.
 *
 * @param {Array<Object>} array array of objects to search
 * @param {string} key          the key of each object to check
 * @param {any} value           the value which the key must be paired with
 * @returns {number} the index of the object with the key/value pair in the array, or -1 if it was not found
 */
export function searchObjectArrayByKeyValue(array: Array < Object >, key: string, value: any) {
  if (array == null || key == null) {
    return -1;
  }

  let low: number = 0;
  let high: number = array.length - 1;
  while (low <= high) {
    const mid: number = Math.floor((low + high) / 2);
    const midName = array[mid][key];

    if (midName < value) {
      low = mid + 1;
    } else if (midName > value) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  return -1;
}

/**
 * Sorts an array of objects by the value of a key.
 *
 * @param {Array<Object>} array an array of objects
 * @param {string} key          the key to sort on
 * @returns {Array<Object>} the sorted array
 */
export function sortObjectArrayByKeyValues(array: Array < Object >, key: string): Array < Object > {
  if (array == null || key == null || key.length <= 0) {
    return array;
  }

  return array.sort((a, b) => {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    } else {
      return 0;
    }
  });
}
