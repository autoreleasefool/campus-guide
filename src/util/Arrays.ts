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
 * @created 2016-10-09
 * @file Arrays.ts
 * @description Defines a set of methods to manipulate arrays.
 */

/**
 * Binary search an array of objects for one that has a key {key} with a value that matches {value}.
 * The array must be sorted on the key being searched.
 *
 * @param {object[]} array array of objects to search
 * @param {string}   key   the key of each object to check
 * @param {any}      value the value which the key must be paired with
 * @returns {number} the index of the object with the key/value pair in the array, or -1 if it was not found
 */
export function binarySearchObjectArrayByKeyValue(array: object[], key: string, value: any): number {
  if (array == undefined || key == undefined || value == undefined || array.length === 0) {
    return -1;
  } else if (!(key in array[0])) {
    return -1;
  }

  let low = 0;
  let high = array.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midValue = array[mid][key];

    if (midValue < value) {
      low = mid + 1;
    } else if (midValue > value) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  return -1;
}

/**
 * Linear search an array of objects for one that has a key {key} with a value that matches {value}.
 *
 * @param {object[]} array array of objects to search
 * @param {string}   key   the key of each object to check
 * @param {any}      value the value which the key must be paired with
 * @returns {number} the index of the object with the key/value pair in the array, or -1 if it was not found
 */
export function linearSearchObjectArrayByKeyValue(array: object[], key: string, value: any): number {
  if (array == undefined || key == undefined || value == undefined || array.length === 0) {
    return -1;
  } else if (!(key in array[0])) {
    return -1;
  }

  const arrayLength = array.length;
  for (let i = 0; i < arrayLength; i++) {
    if (array[i][key] === value) {
      return i;
    }
  }

  return -1;
}

/**
 * Sorts an array of objects by the value of a key.
 *
 * @param {object[]} array        an array of objects
 * @param {string}   key          the key to sort on
 * @param {string}   secondaryKey secondary key to sort on if first key values are identical. Optional.
 * @returns {object[]} the sorted array
 */
export function sortObjectArrayByKeyValues(
    array: object[],
    key: string,
    secondaryKey?: string): object[] {
  if (array == undefined || key == undefined || key.length <= 0) {
    return array;
  }

  return array.sort((a: object, b: object) => {
    if (a[key] < b[key]) {
      return -1;
    } else if (a[key] > b[key]) {
      return 1;
    } else {
      if (secondaryKey != undefined && secondaryKey.length > 0) {
        if (a[secondaryKey] < b[secondaryKey]) {
          return -1;
        } else if (a[secondaryKey] > b[secondaryKey]) {
          return 1;
        }
      }

      return 0;
    }
  });
}
