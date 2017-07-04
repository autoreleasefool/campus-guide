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

// Types
import * as Actions from '../../actionTypes';

// Imports
import { default as reducer, State } from '../navigation';

// Expected initial state
const initialState: State = {
  backNavigations: 0,
  campus: undefined,
  canBack: {},
  discoverView: 0,
  findView: 0,
  housingView: 0,
  linkId: 0,
  residence: undefined,
  tab: 'find',
};

describe('navigation reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should switch to a new tab', () => {
    expect(reducer(initialState, { type: Actions.App.SwitchTab, tab: 'schedule' }))
        .toEqual({ ...initialState, tab: 'schedule' });
  });

  it('should increase the number of back navigations', () => {

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    expect(reducer(initialState, { type: Actions.Navigation.NavigateBack })).toEqual({ ...initialState, backNavigations: 1 });

    /* tslint:enable max-line-length */

  });

  it('should update the state for a key which can back navigate', () => {
    const updatedState = reducer(initialState, { type: Actions.Navigation.CanBack, key: 'test_key', can: true });
    expect(updatedState).toEqual({ ...initialState, canBack: { test_key: true } });
    const finalState = reducer(updatedState, { type: Actions.Navigation.CanBack, key: 'test_key', can: false });
    expect(finalState).toEqual({ ...initialState, canBack: { test_key: false } });
  });

  it('switches the find view', () => {
    expect(reducer(initialState, { type: Actions.App.SwitchFindView, view: 1 }))
        .toEqual({ ...initialState, findView: 1 });
  });

  it('switches the discover view', () => {
    expect(reducer(initialState, { type: Actions.App.SwitchDiscoverView, view: 1 }))
        .toEqual({ ...initialState, discoverView: 1 });
  });

  it('switches the housing view', () => {
    expect(reducer(initialState, { type: Actions.App.SwitchHousingView, view: 1 }))
        .toEqual({ ...initialState, housingView: 1 });
  });

  it('switches the link id', () => {
    expect(reducer(initialState, { type: Actions.App.SwitchDiscoverLink, linkId: 1 }))
        .toEqual({ ...initialState, linkId: 1 });
  });

  it('switches the campus', () => {
    const campus = { image: 'image', name: 'name' };
    expect(reducer(initialState, { type: Actions.App.SwitchDiscoverTransitCampus, campus }))
        .toEqual({ ...initialState, campus });
  });

  it('switches the residence', () => {
    const residence = { image: 'image', name: 'name' };
    expect(reducer(initialState, { type: Actions.App.SwitchHousingResidence, residence }))
        .toEqual({ ...initialState, residence });
  });

});
