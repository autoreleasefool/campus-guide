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
 * @file Arrays-test.ts
 * @description Tests the functionality of the Arrays utility class
 *
 */
'use strict';

/* tslint:disable no-magic-numbers */
/* Let us define exactly where in the array a value should be expected to be found. */

// Require the modules used in testing
import * as Arrays from '../Arrays';

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
  {
    key: 'c',
    other_key: 5,
  },
  {
    key: 'c',
    other_key: 5,
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
  {
    key: 'c',
    other_key: 5,
  },
  {
    key: 'c',
    other_key: 5,
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
  {
    key: 'c',
    other_key: 5,
  },
  {
    key: 'c',
    other_key: 5,
  },
];

describe('Arrays-test', () => {
  beforeEach(() => {
    emptyArray = [];
    unsortedArray = [
      {
        key: 'c',
        other_key: 2,
      },
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
        other_key: 5,
      },
      {
        key: 'b',
        other_key: 1,
      },
      {
        key: 'c',
        other_key: 5,
      },
    ];
  });

  it('tests that sorting an array is in place', () => {
    Arrays.sortObjectArrayByKeyValues(unsortedArray, 'key');
    expect(unsortedArray).toEqual(sortedArrayByKey);
  });

  it('tests sorting an array by a key', () => {
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, 'key')).toEqual(sortedArrayByKey);
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, 'other_key')).toEqual(sortedArrayByOtherKey);
  });

  it('tests sorting an array by multiple keys', () => {
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, 'key', 'other_key')).toEqual(sortedArrayByBothKeys);
  });

  it('tests sorting an invalid array', () => {
    expect(Arrays.sortObjectArrayByKeyValues(emptyArray, 'key')).toEqual([]);
    expect(Arrays.sortObjectArrayByKeyValues(undefined, 'key')).not.toBeDefined();
  });

  it('tests sorting by an invalid key', () => {
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, undefined)).toEqual(unsortedArray);
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, '')).toEqual(unsortedArray);
  });

  it('tests sorting by an invalid secondary key', () => {
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, 'key', undefined)).toEqual(sortedArrayByKey);
    expect(Arrays.sortObjectArrayByKeyValues(unsortedArray, 'key', '')).toEqual(sortedArrayByKey);
  });

  it('tests binary searching an array by a key', () => {
    expect(Arrays.binarySearchObjectArrayByKeyValue(sortedArrayByKey, 'key', 'a')).toEqual(0);
    expect(Arrays.linearSearchObjectArrayByKeyValue(sortedArrayByKey, 'key', 'd')).toEqual(-1);
  });

  it('tests binary searching an invalid array', () => {
    expect(Arrays.binarySearchObjectArrayByKeyValue([], 'key', 'a')).toEqual(-1);
    expect(Arrays.binarySearchObjectArrayByKeyValue(undefined, 'key', 'a')).toEqual(-1);
  });

  it('tests binary searching an array by an invalid key', () => {
    expect(Arrays.binarySearchObjectArrayByKeyValue(sortedArrayByKey, undefined, 'a')).toEqual(-1);
    expect(Arrays.binarySearchObjectArrayByKeyValue(sortedArrayByKey, 'not_a_key', 'a')).toEqual(-1);
  });

  it('tests linear searching an array by a key', () => {
    expect(Arrays.linearSearchObjectArrayByKeyValue(unsortedArray, 'key', 'a')).toEqual(2);
    expect(Arrays.linearSearchObjectArrayByKeyValue(unsortedArray, 'key', 'c')).toEqual(0);
    expect(Arrays.linearSearchObjectArrayByKeyValue(unsortedArray, 'key', 'd')).toEqual(-1);
  });

  it('tests linear searching an invalid array', () => {
    expect(Arrays.linearSearchObjectArrayByKeyValue([], 'key', 'a')).toEqual(-1);
    expect(Arrays.linearSearchObjectArrayByKeyValue(undefined, 'key', 'a')).toEqual(-1);
  });

  it('tests linear searching an array by an invalid key', () => {
    expect(Arrays.linearSearchObjectArrayByKeyValue(sortedArrayByKey, undefined, 'a')).toEqual(-1);
    expect(Arrays.linearSearchObjectArrayByKeyValue(sortedArrayByKey, 'not_a_key', 'a')).toEqual(-1);
  });
});
