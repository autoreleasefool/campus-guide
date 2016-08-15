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
 * @file SearchManager-test.js
 * @description Tests setting and retrieving search listeners for the application.
 *
 */
'use strict';

/* eslint-disable no-magic-numbers */
/* Not concerned about magic numbers here because their intent is obvious. */

// Unmock modules so the real module is used.
jest.unmock('SearchManager');

// Import type definitions.
import type {
  SearchListener,
} from '../SearchManager';

// Default search listener.
const defaultSearchListener: SearchListener = {
  onSearch: jest.fn(),
};

// List of alternative search listeners.
const searchListeners: Array<SearchListener> = [
  {
    onSearch: jest.fn(),
  },
  {
    onSearch: jest.fn(),
  },
  {
    onSearch: jest.fn(),
  },
];

// Text which will be used to invoke a search.
const DEFAULT_SEARCH_TEXT = 'This is a search.';

describe('SearchManager-test', () => {

  // SearchManager utility class
  let SearchManager;

  beforeEach(() => {
    // Re-require the class each time to prevent persistence between tests
    SearchManager = require('SearchManager');

    // Clear mock calls
    defaultSearchListener.onSearch.mockClear();
    for (let i = 0; i < searchListeners.length; i++) {
      searchListeners[i].onSearch.mockClear();
    }
  });

  it('tests the number of search listeners is accurate', () => {
    // Add the first search listener a couple times, make sure count is accurate
    expect(SearchManager.numberOfSearchListeners()).toBe(0);
    SearchManager.addSearchListener(searchListeners[0]);
    expect(SearchManager.numberOfSearchListeners()).toBe(1);
    SearchManager.addSearchListener(searchListeners[0]);
    expect(SearchManager.numberOfSearchListeners()).toBe(1);

    // Add another search listener with same priority, check count again
    SearchManager.addSearchListener(searchListeners[1]);
    expect(SearchManager.numberOfSearchListeners()).toBe(2);

    // Add higher priority listener, check count again
    SearchManager.addSearchListener(searchListeners[2], true);
    expect(SearchManager.numberOfSearchListeners()).toBe(3);

    // Remove a listener, check count
    SearchManager.removeSearchListener(searchListeners[0]);
    expect(SearchManager.numberOfSearchListeners()).toBe(2);

    // Remove all the listeners, check count
    SearchManager.removeAllSearchListeners();
    expect(SearchManager.numberOfSearchListeners()).toBe(0);
  });

  it('tests adding search listeners with varying priorities', () => {
    // Add search listeners with varying priotities
    SearchManager.addSearchListener(searchListeners[0]);
    SearchManager.addSearchListener(searchListeners[1], true);
    SearchManager.addSearchListener(searchListeners[2]);

    const highestPriorityListeners = SearchManager.getHighestPrioritySearchListeners();
    // Iterate over the listeners and call onSearch
    for (let i = 0; i < highestPriorityListeners.length; i++) {
      highestPriorityListeners[i].onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Iterate over the listeners and make sure onSearch was successfully invoked for each
    expect(searchListeners[0].onSearch).not.toBeCalled();
    expect(searchListeners[1].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
    expect(searchListeners[2].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
  });

  it('tests removing higher priority search listeners.', () => {
    // Add search listeners with varying priotities
    SearchManager.addSearchListener(searchListeners[0]);
    SearchManager.addSearchListener(searchListeners[1], true);
    SearchManager.addSearchListener(searchListeners[2]);

    // Remove 1 of the 2 higher priority listeners
    SearchManager.removeSearchListener(searchListeners[2]);

    let highestPriorityListeners = SearchManager.getHighestPrioritySearchListeners();
    // Iterate over the listeners and call onSearch
    for (let i = 0; i < highestPriorityListeners.length; i++) {
      highestPriorityListeners[i].onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Iterate over the listeners and make sure onSearch was successfully invoked for each
    expect(searchListeners[0].onSearch).not.toBeCalled();
    expect(searchListeners[1].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
    expect(searchListeners[2].onSearch).not.toBeCalled();

    // Clear mock calls
    for (let i = 0; i < searchListeners.length; i++) {
      searchListeners[i].onSearch.mockClear();
    }

    // Remove the other high priority listener
    SearchManager.removeSearchListener(searchListeners[1]);

    highestPriorityListeners = SearchManager.getHighestPrioritySearchListeners();
    // Iterate over the listeners and call onSearch
    for (let i = 0; i < highestPriorityListeners.length; i++) {
      highestPriorityListeners[i].onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Iterate over the listeners and make sure onSearch was successfully invoked for each
    expect(searchListeners[0].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
    expect(searchListeners[1].onSearch).not.toBeCalled();
    expect(searchListeners[2].onSearch).not.toBeCalled();
  });

  it('tests removing lower priority search listeners', () => {
    // Add search listeners with varying priotities
    SearchManager.addSearchListener(searchListeners[0]);
    SearchManager.addSearchListener(searchListeners[1], true);
    SearchManager.addSearchListener(searchListeners[2]);

    // Remove the lower priority listener
    SearchManager.removeSearchListener(searchListeners[0]);

    const highestPriorityListeners = SearchManager.getHighestPrioritySearchListeners();
    // Iterate over the listeners and call onSearch
    for (let i = 0; i < highestPriorityListeners.length; i++) {
      highestPriorityListeners[i].onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Iterate over the listeners and make sure onSearch was successfully invoked for each
    expect(searchListeners[0].onSearch).not.toBeCalled();
    expect(searchListeners[1].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
    expect(searchListeners[2].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
  });

  it('tests the setting and retrieval of a default search listener.', () => {
    // Make sure there isn't already a search listener
    expect(SearchManager.getDefaultSearchListener()).toBeNull();

    // Add the default search listener
    SearchManager.setDefaultSearchListener(defaultSearchListener);
    expect(SearchManager.getDefaultSearchListener()).toBe(defaultSearchListener);

    // Test to make sure it's been set correctly
    SearchManager.getDefaultSearchListener().onSearch(DEFAULT_SEARCH_TEXT);
    expect(defaultSearchListener.onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);

    // Test clean up
    SearchManager.setDefaultSearchListener(null);
    expect(SearchManager.getDefaultSearchListener()).toBeNull();
  });

  it('tests setting multiple search listeners.', () => {
    // Add all of the search listeners
    for (let i = 0; i < searchListeners.length; i++) {
      SearchManager.addSearchListener(searchListeners[i]);
    }

    // Iterate over the listeners and call onSearch
    for (let i = 0; i < SearchManager.numberOfSearchListeners(); i++) {
      SearchManager.getSearchListener(i).onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Iterate over the listeners and make sure onSearch was successfully invoked for each
    // then clear the call
    for (let i = 0; i < searchListeners.length; i++) {
      expect(searchListeners[i].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
    }
  });

  it ('tests adding then removing a search listener.', () => {
    // Add all of the search listeners
    for (let i = 0; i < searchListeners.length; i++) {
      SearchManager.addSearchListener(searchListeners[i]);
    }

    // Iterate over the listeners and call onSearch, then check if it worked
    for (let i = 0; i < SearchManager.numberOfSearchListeners(); i++) {
      SearchManager.getSearchListener(i).onSearch(DEFAULT_SEARCH_TEXT);
      expect(searchListeners[i].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
      searchListeners[i].onSearch.mockClear();
    }

    // Remove just the first search listener
    SearchManager.removeSearchListener(0);

    // Iterate over the listeners and call onSearch again
    for (let i = 0; i < SearchManager.numberOfSearchListeners(); i++) {
      SearchManager.getSearchListener(i).onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Iterate over the listeners and make sure onSearch was successfully invoked for all except the first
    // then clear the call
    for (let i = 0; i < searchListeners.length; i++) {
      if (i >= SearchManager.numberOfSearchListeners()) {
        expect(searchListeners[i].onSearch).not.toBeCalled();
      } else {
        expect(searchListeners[i].onSearch).toBeCalledWith(DEFAULT_SEARCH_TEXT);
      }

      searchListeners[i].onSearch.mockClear();
    }

    // Remove the remaining search listeners
    SearchManager.removeAllSearchListeners();

    // Iterate over the listeners and call onSearch again
    for (let i = 0; i < SearchManager.numberOfSearchListeners(); i++) {
      SearchManager.getSearchListener(i).onSearch(DEFAULT_SEARCH_TEXT);
    }

    // Ensure onSearch was not called for any of the listeners
    for (let i = 0; i < searchListeners.length; i++) {
      expect(searchListeners[i].onSearch).not.toBeCalled();
    }
  });

  it('fails to add a search listener more than once.', () => {
    // Add all of the search listeners, with success
    for (let i = 0; i < searchListeners.length; i++) {
      expect(SearchManager.addSearchListener(searchListeners[i])).toBeTruthy();
    }

    // Add all of the search listeners again, but this time they should fail
    for (let i = 0; i < searchListeners.length; i++) {
      expect(SearchManager.addSearchListener(searchListeners[i])).toBeFalsy();
    }
  });

  it('fails to remove a search listener more than once.', () => {
    // Add all of the search listeners
    for (let i = 0; i < searchListeners.length; i++) {
      SearchManager.addSearchListener(searchListeners[i]);
    }

    // Remove all of the search listeners, with success
    for (let i = 0; i < searchListeners.length; i++) {
      expect(SearchManager.removeSearchListener(searchListeners[i])).toBeTruthy();
    }

    // Remove all of the search listeners, but this time they should fail
    for (let i = 0; i < searchListeners.length; i++) {
      expect(SearchManager.removeSearchListener(searchListeners[i])).toBeFalsy();
    }
  });

  it('fails to retrieve a search listener that doesn\'t exist.', () => {
    // Add all of the search listeners
    for (let i = 0; i < searchListeners.length; i++) {
      SearchManager.addSearchListener(searchListeners[i]);
    }

    expect(SearchManager.getSearchListener(-1)).toBeNull();
    expect(SearchManager.getSearchListener(searchListeners.length)).toBeNull();
  });

  it('tests pausing the search listeners', () => {
    // Add all of the search listeners
    for (let i = 0; i < searchListeners.length; i++) {
      SearchManager.addSearchListener(searchListeners[i]);
    }

    // All search listeners should be available
    expect(SearchManager.numberOfSearchListeners()).toBe(searchListeners.length);

    // No search listeners should be available
    SearchManager.pauseAllSearchListeners();
    expect(SearchManager.numberOfSearchListeners()).toBe(0);

    // Iterate over the listeners, which should return null
    for (let i = 0; i < searchListeners.length; i++) {
      expect(SearchManager.getSearchListener(i)).toBeNull();
    }

    // All search listeners should be available again
    SearchManager.resumeAllSearchListeners();
    expect(SearchManager.numberOfSearchListeners()).toBe(searchListeners.length);
  });
});
