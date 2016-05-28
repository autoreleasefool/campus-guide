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
 * @file SearchManager.js
 * @description Provides methods for interacting with the NavBar search input from throughout the app.
 * @flow
 *
 */
'use strict';

// Definition of a search listener.
export type SearchListener = {
  onSearch: (text: string) => void,
};

// List of current search listeners. Components can register a listener with addSearchListener.
let searchListeners: Array<SearchListener> = [];

// The default SearchListener, when no others are available.
let defaultSearchListener: ?SearchListener = null;

module.exports = {

  /**
   * Adds a listener to user input from the search bar.
   *
   * @param {SearchListener} listener instance of SearchListener.
   * @returns {boolean} true if the listener was added, false otherwise.
   */
  addSearchListener(listener: SearchListener): boolean {
    if (searchListeners.indexOf(listener) < 0) {
      searchListeners.push(listener);
      return true;
    }

    return false;
  },

  /**
   * Gets the default search listener.
   *
   * @returns {?SearchListener} the default search listener, if it has been set.
   */
  getDefaultSearchListener(): ?SearchListener {
    return defaultSearchListener;
  },

  /**
   * Retrieves a search listener that has been added.
   *
   * @param {number} index index of search listener to retrieve. Must be greater than or equal to 0
   *                       and less than numberOfSearchListeners.
   * @returns {?SearchListener} the search listener at index or null.
   */
  getSearchListener(index: number): ?SearchListener {
    if (index < 0 || index >= this.numberOfSearchListeners()) {
      return null;
    }

    return searchListeners[index];
  },

  /**
   * Counts the total number of search listeners and returns it.
   *
   * @returns {number} number of search listeners added and not removed.
   */
  numberOfSearchListeners(): number {
    return searchListeners.length;
  },

  /**
   * Removes all listeners to user input from the search bar.
   */
  removeAllSearchListeners(): void {
    searchListeners = [];
  },

  /**
   * Removes the first instance of a listener to user input from the search bar.
   *
   * @param {SearchListener} listener instance of SearchListener.
   * @returns {boolean} true if the listener was removed, false otherwise.
   */
  removeSearchListener(listener: SearchListener): boolean {
    const listenerIndex = searchListeners.indexOf(listener);
    if (listenerIndex >= 0) {
      delete searchListeners[listenerIndex];
      return true;
    }

    return false;
  },

  /**
   * Sets a default search listener to use when there are no other listeners available.
   *
   * @param {SearchListener} listener the new default search listener. Can be null.
   */
  setDefaultSearchListener(listener: ?SearchListener): void {
    defaultSearchListener = listener;
  },
};
