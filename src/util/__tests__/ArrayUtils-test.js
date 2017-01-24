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
const emptyArray = [];

// Unsorted array of objects with 2 keys for testing
const unsortedArray = [
  {
    key: 'b',
    other_key: 1,
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

// Array of objects, sorted by 'key'
const sortedArrayByKey = [
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
];

describe('ArrayUtils-test', () => {
  it('tests sorting an array by a key', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'key')).toEqual(sortedArrayByKey);
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, 'other_key')).toEqual(sortedArrayByOtherKey);
  });

  it('tests sorting an invalid array', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(emptyArray, 'key')).toEqual([]);
    expect(ArrayUtils.sortObjectArrayByKeyValues(null, 'key')).toBeNull();
  });

  it('tests sorting by an invalid key', () => {
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, null)).toEqual(unsortedArray);
    expect(ArrayUtils.sortObjectArrayByKeyValues(unsortedArray, '')).toEqual(unsortedArray);
  });

  it('tests searching an array by a key', () => {
    expect(ArrayUtils.searchObjectArrayByKeyValue(sortedArrayByKey, 'key', 'a')).toEqual(0);
    expect(ArrayUtils.searchObjectArrayByKeyValue(sortedArrayByKey, 'key', 'c')).toEqual(3);
  });

  it('tests searching an invalid array', () => {
    expect(ArrayUtils.searchObjectArrayByKeyValue([], 'key', 'a')).toEqual(-1);
    expect(ArrayUtils.searchObjectArrayByKeyValue(null, 'key', 'a')).toEqual(-1);
  });

  it('tests searching an array by an invalid key', () => {
    expect(ArrayUtils.searchObjectArrayByKeyValue(sortedArrayByKey, null, 'a')).toEqual(-1);
    expect(ArrayUtils.searchObjectArrayByKeyValue(sortedArrayByKey, 'not_a_key', 'a')).toEqual(-1);
  });
});
