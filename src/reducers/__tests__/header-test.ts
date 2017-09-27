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
 * @created 2016-10-19
 * @file header-test.ts
 * @description Tests header reducers
 *
 */
'use strict';

// Imports
import { default as reducer, State } from '../header';

// Types
import * as Actions from '../../actionTypes';

// Expected initial state
const initialState: State = {
  showBack: false,
  showSearch: true,
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
    discover: [{ name_en: 'Campus Guide', name_fr: 'Guide de campus' }],
    find: [{ name_en: 'Campus Guide', name_fr: 'Guide de campus' }],
    schedule: [{ name_en: 'Campus Guide', name_fr: 'Guide de campus' }],
    search: [{ name_en: 'Campus Guide', name_fr: 'Guide de campus' }],
    settings: [{ name_en: 'Campus Guide', name_fr: 'Guide de campus' }],
  },
  title: { name_en: 'Campus Guide', name_fr: 'Guide de campus' },
};

const findTabDuplicated = [ initialState.tabTitles.find[0], initialState.tabTitles.find[0] ];
const findTabChanged = [ initialState.tabTitles.find[0], 'title' ];
const scheduleTabChanged = [ initialState.tabTitles.schedule[0], 'schedule' ];

describe('header reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should use the default header title for a tab', () => {
    expect(
      reducer(
        initialState,
        { type: Actions.Header.PushTitle, title: undefined, tab: 'find' }
      )
    ).toEqual({
      ...initialState,
      tabTitles: {
        ...initialState.tabTitles,
        find: findTabDuplicated,
      },
    });
  });

  it('should revert the title for a tab', () => {
    const updatedState = reducer(initialState, { type: Actions.Header.PushTitle, title: 'title', tab: 'find' });
    expect(reducer(updatedState, { type: Actions.Navigation.NavigateBack, tab: 'find' })).toEqual(initialState);
  });

  it('should use the default header title for a tab', () => {
    expect(
      reducer(
        initialState,
        { type: Actions.Header.PushTitle, title: 'title', tab: 'find' }
      )
    ).toEqual({
      ...initialState,
      tabTitles: {
        ...initialState.tabTitles,
        find: findTabChanged,
      },
      title: 'title',
    });
  });

  it('should show the back button', () => {
    expect(reducer(initialState, { type: Actions.Header.ShowBack, show: true }))
        .toEqual({ ...initialState, showBack: true });
  });

  it('should show the back button for a tab', () => {
    expect(reducer(initialState, { type: Actions.Header.ShowBack, show: true, tab: 'find' }))
        .toEqual({
          ...initialState,
          showBack: true,
          tabShowBack: {
            discover: false,
            find: true,
            schedule: false,
            search: false,
            settings: false,
          },
        });
  });

  it('should show the search button', () => {
    expect(reducer(initialState, { type: Actions.Header.ShowSearch, show: true }))
        .toEqual({ ...initialState, showSearch: true });
  });

  it('should show the search button for a tab', () => {
    expect(reducer(initialState, { type: Actions.Header.ShowSearch, show: true, tab: 'schedule' }))
        .toEqual({
          ...initialState,
          showSearch: true,
          tabShowSearch: {
            discover: false,
            find: true,
            schedule: true,
            search: true,
            settings: false,
          },
        });
  });

  it('should set the title and back/search buttons when the tab changes', () => {
    let updatedState = reducer(initialState, { type: Actions.Header.PushTitle, title: 'schedule', tab: 'schedule' });
    updatedState = reducer(updatedState, { type: Actions.Header.ShowBack, show: true, tab: 'schedule' });
    updatedState = reducer(updatedState, { type: Actions.Header.ShowSearch, show: true, tab: 'schedule' });

    expect(reducer(updatedState, { type: Actions.App.SwitchTab, tab: 'schedule' }))
        .toEqual({
          ...initialState,
          showBack: true,
          showSearch: true,
          tabShowBack: {
            ...initialState.tabShowBack,
            schedule: true,
          },
          tabShowSearch: {
            ...initialState.tabShowSearch,
            schedule: true,
          },
          tabTitles: {
            ...initialState.tabTitles,
            schedule: scheduleTabChanged,
          },
          title: 'schedule',
        });
  });

});
