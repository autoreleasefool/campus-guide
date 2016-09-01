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
 * @providesModule SearchManager
 * @description Provides methods for interacting with the NavBar search input from throughout the app.
 *
 * @flow
 */
'use strict';

// Definition of a search listener.
export type SearchListener = {
  onSearch: (text: ?string) => void,
};

// Associate each SearchListener with a priority level.
type PrioriziedListener = {
  listener: SearchListener,
  priority: number,
}

// List of current search listeners. Components can register a listener with addSearchListener.
let searchListeners: Array < PrioriziedListener > = [];
// The default SearchListener, when no others are available.
let defaultSearchListener: ?SearchListener = null;
// Indicates if all searchListeners except defaultSearchListener should be ignored.
let searchListenersPaused: boolean = false;
// Current priority level for SearchListeners.
let currentPriority = 0;

module.exports = {

  /**
   * Adds a listener to user input from the search bar.
   *
   * @param {SearchListener} listener instance of SearchListener.
   * @param {?boolean} higherPriority if true, the priority level is incremented before adding a SearchListener.
   *                                  By incrementing the priority level, it is ensured that the new SearchListener
   *                                  will be invoked and any SearchListeners of lower priority will be ignored, until
   *                                  all SearchListeners of higher priority level are removed.
   * @returns {boolean} true if the listener was added, false otherwise.
   */
  addSearchListener(listener: SearchListener, higherPriority: ?boolean): boolean {
    for (let i = 0; i < searchListeners.length; i++) {
      if (searchListeners[i].listener == listener) {
        return false;
      }
    }

    // Increase priority if this listener should be higher priority
    if (higherPriority) {
      currentPriority++;
    }

    // Wrap the listener with its priority
    searchListeners.push({
      listener: listener,
      priority: currentPriority,
    });

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
   * Gets the search listeners which are of the highest priority.
   *
   * @returns {Array<SearchListener>} list of SearchListeners.
   */
  getHighestPrioritySearchListeners(): Array < SearchListener > {
    const priorityListeners: Array < SearchListener > = [];
    for (let i = 0; i < searchListeners.length; i++) {
      if (searchListeners[i].priority === currentPriority) {
        priorityListeners.push(searchListeners[i].listener);
      }
    }

    return priorityListeners;
  },

  /**
   * Retrieves a search listener that has been added.
   *
   * @param {number} index index of search listener to retrieve. Must be greater than or equal to 0 and less than
   *                       numberOfSearchListeners.
   * @returns {?SearchListener} the search listener at index or null.
   */
  getSearchListener(index: number): ?SearchListener {
    if (index < 0 || index >= this.numberOfSearchListeners() || searchListenersPaused) {
      return null;
    }

    return searchListeners[index].listener;
  },

  /**
   * Counts the total number of search listeners and returns it. Returns 0 if pauseAllSearchListeners was called.
   *
   * @returns {number} number of search listeners added and not removed.
   */
  numberOfSearchListeners(): number {
    return (searchListenersPaused) ? 0 : searchListeners.length;
  },

  /**
   * Causes all search listeners to stop taking input except defaultSearchListener, and causes
   * numberOfSearchListeners() to return 0, until resumeAllSearchListeners() is called.
   */
  pauseAllSearchListeners(): void {
    searchListenersPaused = true;
  },

  /**
   * Reverses the effects of pauseAllSearchListeners, or does nothing if pauseAllSearchListeners has not been called.
   */
  resumeAllSearchListeners(): void {
    searchListenersPaused = false;
  },

  /**
   * Removes all listeners to user input from the search bar.
   */
  removeAllSearchListeners(): void {
    searchListeners = [];
    currentPriority = 0;
  },

  /**
   * Removes the first instance of a listener to user input from the search bar.
   *
   * @param {SearchListener} listener instance of SearchListener.
   * @returns {boolean} true if the listener was removed, false otherwise.
   */
  removeSearchListener(listener: SearchListener): boolean {
    let listenerIndex = -1;
    let priority = -1;
    for (let i = 0; i < searchListeners.length; i++) {
      if (searchListeners[i].listener == listener) {
        listenerIndex = i;
        priority = searchListeners[i].priority;
      }
    }

    if (listenerIndex >= 0) {
      searchListeners.splice(listenerIndex, 1);

      // Check if any other listeners of the same priority exist
      let shouldDecreasePriority: boolean = true;
      if (priority === currentPriority) {
        for (let i = 0; i < searchListeners.length && shouldDecreasePriority; i++) {
          if (searchListeners[i].priority === priority) {
            shouldDecreasePriority = false;
          }
        }
      } else {
        shouldDecreasePriority = false;
      }

      // If not, lower the priority
      if (shouldDecreasePriority) {
        currentPriority--;
      }

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
