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
 * @created 2016-10-18
 * @file navigation-test.ts
 * @description Tests navigation reducers
 *
 */
'use strict';

// Mock translations for app name
jest.mock('../../../assets/json/CoreTranslations.json', () => ({
  en: {
    app_name: 'Campus Guide',
    discover: 'discover',
    find: 'find',
    schedule: 'schedule',
    search: 'search',
    settings: 'settings',
  },
  fr: {
    app_name: 'Guide de Campus',
    discover: 'discover',
    find: 'find',
    schedule: 'schedule',
    search: 'search',
    settings: 'settings',
  },
}));

// Types
import * as Actions from '../../actionTypes';

// Imports
import * as Constants from '../../constants';
import { default as reducer, State } from '../navigation';
const CoreTranslations = require('../../../assets/json/CoreTranslations');

const defaultTitle = {
  name_en: CoreTranslations.en.app_name,
  name_fr: CoreTranslations.fr.app_name,
};

/* tslint:disable object-literal-sort-keys */
/* Better organization of initial state keys */

// Expected initial state
const initialState: State = {
  backNavigations: 0,
  canBack: {},
  tab: 'find',

  findView: 0,
  discoverView: 0,
  housingView: 0,
  linkId: 0,
  campus: undefined,
  residence: undefined,

  showBack: false,
  showBackDisableCount: 0,
  showSearch: true,
  showSearchDisableCount: 0,
  tabShowBack: {
    discover: false,
    find: false,
    schedule: false,
    search: false,
    settings: false,
  },
  tabShowSearch: {
    discover: false,
    find: true,
    schedule: false,
    search: true,
    settings: false,
  },
  tabTitles: {
    discover: {
      [Constants.Views.Discover.Home]: {
        name_en: CoreTranslations.en.discover,
        name_fr: CoreTranslations.fr.discover,
      },
    },
    find: {
      [Constants.Views.Find.Home]: defaultTitle,
    },
    schedule: {
      [Constants.Views.Schedule.Home]: {
        name_en: CoreTranslations.en.schedule,
        name_fr: CoreTranslations.fr.schedule,
      },
    },
    search: {
      [Constants.Views.Search.Home]: {
        name_en: CoreTranslations.en.search,
        name_fr: CoreTranslations.fr.search,
      },
    },
    settings: {
      [Constants.Views.Settings.Home]: {
        name_en: CoreTranslations.en.settings,
        name_fr: CoreTranslations.fr.settings,
      },
    },
  },
  title: defaultTitle,
};

/* tslint:enable object-literal-sort-keys */

describe('navigation reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: Actions.Other.Invalid })).toEqual(initialState);
  });

  it('should switch to a new tab', () => {
    expect(reducer(initialState, { type: Actions.Navigation.SwitchTab, tab: 'schedule' }))
        .toEqual({
          ...initialState,
          showSearch: initialState.tabShowSearch.schedule,
          tab: 'schedule',
          title: initialState.tabTitles.schedule[Constants.Views.Schedule.Home],
        });
  });

  it('should increase the number of back navigations', () => {
    expect(reducer(initialState, { type: Actions.Navigation.NavigateBack }))
        .toEqual({ ...initialState, backNavigations: 1 });
  });

  it('should update the state for a key which can back navigate', () => {
    const updatedState = reducer(initialState, { type: Actions.Navigation.CanBack, key: 'test_key', can: true });
    expect(updatedState).toEqual({ ...initialState, canBack: { test_key: true } });
    const finalState = reducer(updatedState, { type: Actions.Navigation.CanBack, key: 'test_key', can: false });
    expect(finalState).toEqual({ ...initialState, canBack: { test_key: false } });
  });

  it('switches the find view', () => {
    expect(reducer(initialState, { type: Actions.Navigation.SwitchFindView, view: 1 }))
        .toEqual({ ...initialState, findView: 1 });
  });

  it('switches the discover view', () => {
    expect(reducer(initialState, { type: Actions.Navigation.SwitchDiscoverView, view: 1 }))
        .toEqual({ ...initialState, discoverView: 1 });
  });

  it('switches the housing view', () => {
    expect(reducer(initialState, { type: Actions.Navigation.SwitchHousingView, view: 1 }))
        .toEqual({ ...initialState, housingView: 1, title: initialState.tabTitles.discover[0] });
  });

  it('switches the link id', () => {
    expect(reducer(initialState, { type: Actions.Navigation.SwitchDiscoverLink, linkId: 1 }))
        .toEqual({ ...initialState, linkId: 1, title: initialState.tabTitles.discover[0] });
  });

  it('switches the campus', () => {
    const campus = { image: 'image', name: 'name', id: 'id' };
    expect(reducer(initialState, { type: Actions.Navigation.SwitchDiscoverTransitCampus, campus }))
        .toEqual({ ...initialState, campus, title: initialState.tabTitles.discover[0] });
  });

  it('switches the residence', () => {
    const residence = { image: 'image', name: 'name', location: { latitude: 0, longitude: 0 }, props: [] };
    expect(reducer(initialState, { type: Actions.Navigation.SwitchHousingResidence, residence }))
        .toEqual({ ...initialState, residence, title: initialState.tabTitles.discover[0] });
  });

  it('should not alter the tab home title', () => {
    expect(
      reducer(
        initialState,
        {
          setActive: false,
          tab: 'find',
          title: 'new title',
          type: Actions.Navigation.SetTitle,
          view: Constants.Views.Find.Home,
        }
      )).toEqual(initialState);
  });

  it('should set the title when setActive is true', () => {
    expect(
      reducer(
        initialState,
        {
          setActive: true,
          tab: 'find',
          title: 'title',
          type: Actions.Navigation.SetTitle,
          view: Constants.Views.Find.Building,
        }
      )
    ).toEqual({
      ...initialState,
      tabTitles: {
        ...initialState.tabTitles,
        find: {
          ...initialState.tabTitles.find,
          [Constants.Views.Find.Building]: 'title',
        },
      },
      title: 'title',
    });
  });

  it('should set the header title for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          setActive: false,
          tab: 'find',
          title: 'title',
          type: Actions.Navigation.SetTitle,
          view: Constants.Views.Find.Building,
        }
      )
    ).toEqual({
      ...initialState,
      tabTitles: {
        ...initialState.tabTitles,
        find: {
          ...initialState.tabTitles.find,
          [Constants.Views.Find.Building]: 'title',
        },
      },
    });
  });

  it('should show the back button for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          disableAnimation: false,
          show: true,
          tab: 'find',
          type: Actions.Navigation.ShowBack,
        }
      )
    ).toEqual({
      ...initialState,
      showBack: true,
      tabShowBack: {
        ...initialState.tabShowBack,
        find: true,
      },
    });
  });

  it('should show the back button for a tab, with no animation', () => {
    expect(
      reducer(
        initialState,
        {
          disableAnimation: true,
          show: true,
          tab: 'find',
          type: Actions.Navigation.ShowBack,
        }
      )
    ).toEqual({
      ...initialState,
      showBack: true,
      showBackDisableCount: 1,
      tabShowBack: {
        ...initialState.tabShowBack,
        find: true,
      },
    });
  });

  it('should show the search button for a tab', () => {
    expect(
      reducer(
        initialState,
        {
          disableAnimation: false,
          show: true,
          tab: 'schedule',
          type: Actions.Navigation.ShowSearch,
        }
      )
    ).toEqual({
      ...initialState,
      showSearch: true,
      tabShowSearch: {
        ...initialState.tabShowSearch,
        schedule: true,
      },
    });
  });

  it('should show the search button, with no animation', () => {
    expect(
      reducer(
        initialState,
        {
          disableAnimation: true,
          show: true,
          tab: 'schedule',
          type: Actions.Navigation.ShowSearch,
        }
      )
    ).toEqual({
      ...initialState,
      showSearch: true,
      showSearchDisableCount: 1,
      tabShowSearch: {
        ...initialState.tabShowSearch,
        schedule: true,
      },
    });
  });

  it('should set the title and back/search buttons when the tab changes', () => {
    let updatedState = reducer(
      initialState,
      {
        setActive: false,
        tab: 'discover',
        title: 'discover',
        type: Actions.Navigation.SetTitle,
        view: Constants.Views.Discover.Transit,
      }
    );
    updatedState = reducer(updatedState,
        { type: Actions.Navigation.ShowBack, show: true, tab: 'discover', disableAnimation: false });
    updatedState = reducer(updatedState,
        { type: Actions.Navigation.ShowSearch, show: true, tab: 'discover', disableAnimation: false });
    updatedState = reducer(updatedState,
        { type: Actions.Navigation.SwitchDiscoverView, view: Constants.Views.Discover.Transit });

    expect(reducer(updatedState, { type: Actions.Navigation.SwitchTab, tab: 'discover' }))
        .toEqual({
          ...initialState,
          discoverView: Constants.Views.Discover.Transit,
          showBack: true,
          showSearch: true,
          tab: 'discover',
          tabShowBack: {
            ...initialState.tabShowBack,
            discover: true,
          },
          tabShowSearch: {
            ...initialState.tabShowSearch,
            discover: true,
          },
          tabTitles: {
            ...initialState.tabTitles,
            discover: {
              ...initialState.tabTitles.discover,
              [Constants.Views.Discover.Transit]: 'discover',
            },
          },
          title: 'discover',
        });
  });

});
