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
 * @created 2017-11-17
 * @file react-native-fabric.ts
 * @description Mocks the functionality of the npm module `react-native-fabric`
 *
 */
'use strict';

// Mock object
// const Fabric = jest.genMockFromModule('react-native-fabric') as any;
const Fabric: any = {};

interface KeyValueStore {
  [key: string]: any;
}

// Cache stored items
let datastore: KeyValueStore = {};

// Cache events
let events: KeyValueStore = {};

export const Crashlytics = {
  setString: (key: string, value: string): void => {
    datastore[key] = value;
  },
};

/**
 * Ensure a name exists in a key value store.
 *
 * @param {string}        name name to check for
 * @param {KeyValueStore} kvs  key value store
 */
function ensureNameExists(name: string, kvs: KeyValueStore): void {
  if (!(name in kvs)) {
    kvs[name] = [];
  }
}

export const Answers = {
  logContentView: (name: string, menu: string, id: string, options?: KeyValueStore): void => {
    const eventName = `${menu}.${name}.${id}`;
    ensureNameExists(eventName, events);
    events[eventName].push(options);
  },
  logCustom: (eventName: string, options?: KeyValueStore): void => {
    ensureNameExists(eventName, events);
    events[eventName].push(options);
  },
  logSearch: (query: string, options?: KeyValueStore): void => {
    ensureNameExists(query, events);
    events[query].push(options);
  },
};

/**
 * Clear the datastore and events cache.
 */
function __clearCache(): void {
  datastore = {};
  events = {};
}

/**
 * Get access to the datastore, for testing.
 */
function __getDatastore(): KeyValueStore {
  return datastore;
}

/**
 * Get access to the event cache, for testing.
 */
function __getEvents(): KeyValueStore {
  return events;
}

// Expose mock functions
Fabric.__clearCache = __clearCache;
Fabric.__getEvents = __getEvents;
Fabric.__getDatastore = __getDatastore;
export default Fabric;
