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
 * @file ArrayUtils-test.js
 * @description Tests the functionality of ArrayUtils
 *
 */
'use strict';

/* eslint-disable no-magic-numbers */
/* Let us define exactly where in the array a value should be expected to be found. */

// Require the modules used in testing
import * as ArrayUtils from '../ArrayUtils';

// Empty array for testing
let emptyArray = [];
let unsortedArray = [];

// Array of objects, sorted by 'key'
const sortedArrayByKey = [
  {
    key: 'a',
    other_key: 3,
  },
  {
    key: 'b',
    other_key: 4,
  },
  {
    key: 'b',
    other_key: 1,
  },
  {
    key: 'c',
    other_key: 2,
  },
];

// Array of objects, sorted by 'other_key''
const sortedArrayByOtherKey = [
  {
    key: 'b',
    other_key: 1,
  },
  {
    key: 'c',
    other_key: 2,
  },
  {
    key: 'a',
    other_key: 3,
  },
  {
    key: 'b',
    other_key: 4,
  },
];

const sortedArrayByBothKeys = [
  {
    key: 'a',
    other_key: 3,
  },
  {
    key: 'b',
    other_key: 1,
  },
  {
    key: 'b',
    other_key: 4,
  },
  {
    key: 'c',
    other_key: 2,
  },
];

describe('ArrayUtils-test', () => {
  beforeEach(() => {
    emptyArray = [];
    unsortedArray = [
      {
        key: 'b',
        other_key: 4,
      },
      {
        key: 'a',
        other_key: 3,
      },
      {
        key: 'c',
        other_key: 2,
      },
      {
        key: 'b',
        other_key: 1,
      },
    ];
  });

  it('tests sorting an array by a key', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'key')).toEqual(sortedArrayByKey);
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'other_key')).toEqual(sortedArrayByOtherKey);
  });

  it('tests sorting an array by multiple keys', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'key', 'other_key')).toEqual(sortedArrayByBothKeys);
  });

  it('tests sorting an invalid array', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(emptyArray, 'key')).toEqual([]);
    expect(ArrayUtils.sortObjectArrayByKeyValues(null, 'key')).toBeNull();
  });

  it('tests sorting by an invalid key', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, null)).toEqual(unsortedArray);
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, '')).toEqual(unsortedArray);
  });

  it('tests sorting by an invalid secondary key', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'key', null)).toEqual(sortedArrayByKey);
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'key', '')).toEqual(sortedArrayByKey);
  });

  it('tests binary searching an array by a key', () => {
    expect(ArrayUtils.binarySearchObjectArrayByKeyValue(sortedArrayByKey, 'key', 'a')).toEqual(0);
    expect(ArrayUtils.binarySearchObjectArrayByKeyValue(sortedArrayByKey, 'key', 'c')).toEqual(3);
  });

  it('tests binary searching an invalid array', () => {
    expect(ArrayUtils.binarySearchObjectArrayByKeyValue([], 'key', 'a')).toEqual(-1);
    expect(ArrayUtils.binarySearchObjectArrayByKeyValue(null, 'key', 'a')).toEqual(-1);
  });

  it('tests binary searching an array by an invalid key', () => {
    expect(ArrayUtils.binarySearchObjectArrayByKeyValue(sortedArrayByKey, null, 'a')).toEqual(-1);
    expect(ArrayUtils.binarySearchObjectArrayByKeyValue(sortedArrayByKey, 'not_a_key', 'a')).toEqual(-1);
  });

  it('tests linear searching an array by a key', () => {
    expect(ArrayUtils.linearSearchObjectArrayByKeyValue(unsortedArray, 'key', 'a')).toEqual(1);
    expect(ArrayUtils.linearSearchObjectArrayByKeyValue(unsortedArray, 'key', 'c')).toEqual(2);
  });

  it('tests linear searching an invalid array', () => {
    expect(ArrayUtils.linearSearchObjectArrayByKeyValue([], 'key', 'a')).toEqual(-1);
    expect(ArrayUtils.linearSearchObjectArrayByKeyValue(null, 'key', 'a')).toEqual(-1);
  });

  it('tests linear searching an array by an invalid key', () => {
    expect(ArrayUtils.linearSearchObjectArrayByKeyValue(sortedArrayByKey, null, 'a')).toEqual(-1);
    expect(ArrayUtils.linearSearchObjectArrayByKeyValue(sortedArrayByKey, 'not_a_key', 'a')).toEqual(-1);
  });
});
