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
 * @created 2017-01-25
 * @file react-native-simple-store.ts
 * @description Mocks the functionality of the npm module `react-native-simple-store`
 *
 */
'use strict';

// Mock object
const store: any = jest.genMockFromModule('react-native-simple-store');

// Key-value storage
let datastore: any = {};

/**
 * Sets a custom datastore.
 *
 * @param {Object} newDatastore object to replace datastore with
 */
function __setDatastore(newDatastore: any): void {
  datastore = newDatastore;
}

/**
 * Retrieve a value corresponding to a key in the store.
 *
 * @param {string} key identifier
 * @returns {Promise<any>} a promise which resolves with the value corresponding to key
 */
async function get(key: string): Promise<any> {
  return JSON.parse(datastore[key] || 'null');
}

/**
 * Save a key-value pair to the store.
 *
 * @param {string} key   identifier
 * @param {any}    value value to store
 * @returns {Promise<void>} a promise which resolves when the value has been saved
 */
async function save(key: string, value: any): Promise<void> {
  datastore[key] = JSON.stringify(value);
}

// Expose mock functions
store.__setDatastore = __setDatastore;
store.get = get;
store.save = save;
export default store;
