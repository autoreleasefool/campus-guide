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
 * @created 2016-10-19
 * @file header-test.js
 * @description Tests header reducers
 *
 */
'use strict';

// Imports
import reducer from '../header';

// Expected initial state
const initialState = {
  title: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
  tabTitles: {
    find: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
    schedule: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
    discover: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
    search: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
    settings: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
  },
  shouldShowBack: false,
  tabShowBack: {
    find: false,
    schedule: false,
    discover: false,
    search: false,
    settings: false,
  },
  shouldShowSearch: true,
  tabShowSearch: {
    find: true,
    schedule: false,
    discover: false,
    search: true,
    settings: false,
  },
};

describe('navigation reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should set a new header title', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'SET_HEADER_TITLE',
          title: {
            name: 'New title',
          },
        }
      )
    ).toEqual(
      {
        ...initialState,
        title: {
          name: 'New title',
        },
      }
    );
  });

  it('should set a new header title for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'SET_HEADER_TITLE',
          tab: 'find',
          title: {
            name: 'New title',
          },
        }
      )
    ).toEqual(
      {
        ...initialState,
        title: {
          name: 'New title',
        },
        tabTitles: {
          find: {name: 'New title'},
          schedule: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
          discover: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
          search: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
          settings: {name_en: 'Campus Guide', name_fr: 'Guide de campus'},
        },
      }
    );
  });

  it('should use the default header title', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'SET_HEADER_TITLE',
          title: null,
        }
      )
    ).toEqual(
      initialState
    );
  });

  it('should use the default header title for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'SET_HEADER_TITLE',
          title: null,
          tab: 'find',
        }
      )
    ).toEqual(
      initialState
    );
  });

  it('should show the back button', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'HEADER_SHOW_BACK',
          shouldShowBack: true,
        }
      )
    ).toEqual(
      {
        ...initialState,
        shouldShowBack: true,
      }
    );
  });

  it('should show the back button for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'HEADER_SHOW_BACK',
          tab: 'find',
          shouldShowBack: true,
        }
      )
    ).toEqual(
      {
        ...initialState,
        shouldShowBack: true,
        tabShowBack: {
          find: true,
          schedule: false,
          discover: false,
          search: false,
          settings: false,
        },
      }
    );
  });

  it('should show the search button for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'HEADER_SHOW_SEARCH',
          tab: 'schedule',
          shouldShowSearch: true,
        }
      )
    ).toEqual(
      {
        ...initialState,
        shouldShowSearch: true,
        tabShowSearch: {
          find: true,
          schedule: true,
          discover: false,
          search: false,
          settings: false,
        },
      }
    );
  });

  it('should set the title and back/search buttons when the tab changes', () => {
    let updatedState = reducer(
      initialState,
      {
        type: 'SET_HEADER_TITLE',
        title: 'schedule',
        tab: 'schedule',
      }
    );

    updatedState = reducer(
      updatedState,
      {
        type: 'HEADER_SHOW_BACK',
        shouldShowBack: true,
        tab: 'schedule',
      }
    );

    updatedState = reducer(
      updatedState,
      {
        type: 'HEADER_SHOW_SEARCH',
        shouldShowSearch: true,
        tab: 'schedule',
      }
    );

    expect(
      reducer(
        updatedState,
        {
          type: 'SWITCH_TAB',
          tab: 'schedule',
        }
      )
    ).toEqual(
      {
        ...updatedState,
        title: 'schedule',
        shouldShowBack: true,
        shouldShowSearch: true,
      }
    );
  });

  it('should show the search button', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'HEADER_SHOW_SEARCH',
          shouldShowSearch: true,
        }
      )
    ).toEqual(
      {
        ...initialState,
        shouldShowSearch: true,
      }
    );
  });
});
