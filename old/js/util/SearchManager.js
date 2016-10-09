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
 *
 * @flow
 */
'use strict';

// Definition of a search listener.
export type SearchListener = {
  onSearch: (text: ?string) => void,
};

// List of current search listeners. Components can register a listener with addSearchListener.
let searchListeners: Object = {};
// The default SearchListener, when no others are available.
let defaultSearchListener: ?SearchListener = null;
// Indicates if all searchListeners in a group except defaultSearchListener should be ignored.
const searchListenersPaused: Object = {};
// Indicates if all searchListeners except defaultSearchListener should be ignored.
let allSearchListenersPaused = false;

module.exports = {

  /**
   * Adds a listener to user input from the search bar.
   *
   * @param {string}         tag      group identifier for the search listener
   * @param {SearchListener} listener instance of SearchListener.
   * @returns {boolean} true if the listener was added, false otherwise.
   */
  addSearchListener(tag: string, listener: SearchListener): boolean {
    if (tag in searchListeners) {
      for (let i = 0; i < searchListeners[tag].length; i++) {
        if (searchListeners[tag][i].listener == listener) {
          return false;
        }
      }
    } else {
      searchListeners[tag] = [];
      searchListenersPaused[tag] = false;
    }

    searchListeners[tag].push(listener);
    return true;
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
   * Gets the search listener which is of the highest priority (most recently added).
   *
   * @param {string} tag group identifier for the search listener
   * @returns {?SearchListener} the highest priority listener
   */
  getHighestPrioritySearchListener(tag: string): ?SearchListener {
    if (tag in searchListeners && searchListeners[tag].length > 0) {
      return searchListeners[tag][searchListeners[tag].length - 1];
    }

    return null;
  },

  /**
   * Counts the total number of search listeners in the group and returns it.
   * Returns 0 if pauseAllSearchListeners was called.
   *
   * @param {string} tag group identifier
   * @returns {number} number of search listeners added and not removed.
   */
  numberOfSearchListeners(tag: string): number {
    return (allSearchListenersPaused || searchListenersPaused[tag] || !(tag in searchListeners))
        ? 0
        : searchListeners[tag].length;
  },

  /**
   * Causes all search listeners to stop taking input except defaultSearchListener, and causes
   * numberOfSearchListeners(tag) to return 0, until resumeAllSearchListeners is called.
   */
  pauseAllSearchListeners(): void {
    allSearchListenersPaused = true;
  },

  /**
   * Causes all search listeners of a group to stop taking input except defaultSearchListener, and causes
   * numberOfSearchListeners(tag) to return 0, until resumeSearchListeners(tag) is called.
   *
   * @param {string} tag group identifier
   */
  pauseSearchListeners(tag: string): void {
    searchListenersPaused[tag] = true;
  },

  /**
   * Reverses the effects of pauseAllSearchListeners, or does nothing if pauseAllSearchListeners has not
   * been called.
   *
   * @param {string} tag group identifier
   */
  resumeAllSearchListeners(): void {
    allSearchListenersPaused = false;
  },

  /**
   * Reverses the effects of pauseSearchListeners(tag), or does nothing if pauseSearchListeners(tag) has not
   * been called.
   *
   * @param {string} tag group identifier
   */
  resumeSearchListeners(tag: string): void {
    if (tag in searchListenersPaused) {
      searchListenersPaused[tag] = false;
    }
  },

  /**
   * Removes all listeners to user input from the search bar.
   */
  removeAllSearchListeners(): void {
    searchListeners = {};
  },

  /**
   * Removes the first instance of a listener to user input from the search bar.
   *
   * @param {string} tag group identifier
   * @param {SearchListener} listener instance of SearchListener.
   */
  removeSearchListener(tag: string, listener: SearchListener): void {
    if (!(tag in searchListeners)) {
      return;
    }

    for (let i = 0; i < searchListeners[tag].length; i++) {
      if (listener == searchListeners[tag][i]) {
        searchListeners[tag].splice(i, 1);
        break;
      }
    }

    if (searchListeners[tag].length === 0) {
      delete searchListeners[tag];
      delete searchListenersPaused[tag];
    }
  },

  /**
   * Sets a default search listener to use when there are no other listeners available.
   *
   * @param {SearchListener} listener the new default search listener. Can be null.
   */
  setDefaultSearchListener(listener: ?SearchListener): void {
    defaultSearchListener = listener;
  },

  /**
   * Counts the total number of search listeners and returns it. Returns 0 if pauseAllSearchListeners was called.
   *
   * @param {string} tag group identifier
   * @returns {number} number of search listeners added and not removed.
   */
  totalNumberOfSearchListeners(): number {
    if (allSearchListenersPaused) {
      return 0;
    }

    let totalSearchListeners = 0;

    for (const tag in searchListeners) {
      if (searchListeners.hasOwnProperty(tag)) {
        if (searchListenersPaused[tag]) {
          continue;
        }

        totalSearchListeners += searchListeners[tag].length;
      }
    }

    return totalSearchListeners;
  },
};
