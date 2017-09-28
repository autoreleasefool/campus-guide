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
 * @created 2016-10-17
 * @file navigation-test.ts
 * @description Tests navigation actions
 *
 */
'use strict';

// Imports
import * as navigation from '../navigation';

// Types
import { Tab } from '../../../typings/global';
import * as Actions from '../../actionTypes';

describe('navigation actions', () => {

  it('should create an action to switch the tabs', () => {
    const tab: Tab = 'find';
    const expectedAction = { type: Actions.Navigation.SwitchTab, tab };
    expect(navigation.switchTab(tab)).toEqual(expectedAction);
  });

  it('should create an action to navigate backwards', () => {
    const expectedAction = { type: Actions.Navigation.NavigateBack };
    expect(navigation.navigateBack()).toEqual(expectedAction);
  });

  it('should set the state for a key which can back navigate', () => {
    const key = 'test_key';
    const can = true;
    const expectedAction = { type: Actions.Navigation.CanBack, can, key };
    expect(navigation.canNavigateBack(key, can)).toEqual(expectedAction);
  });

  it('should create an action to set the title for a tab, and the active title', () => {
    const title = 'name';
    const tab = 'find';
    const view = 0;
    const setActive = true;
    const expectedAction = { type: Actions.Navigation.SetTitle, title, tab, view, setActive };
    expect(navigation.setHeaderTitle(title, tab, view, setActive)).toEqual(expectedAction);
  });

  it('should create an action to set the title for a tab, without changing the active title', () => {
    const title = 'name';
    const tab = 'find';
    const view = 0;
    const expectedAction = { type: Actions.Navigation.SetTitle, title, tab, view, setActive: false };
    expect(navigation.setHeaderTitle(title, tab, view)).toEqual(expectedAction);
  });

  it('should create an action to show the back button for a tab', () => {
    const show = true;
    const tab = 'find';
    const expectedAction = { type: Actions.Navigation.ShowBack, show, tab };
    expect(navigation.showBack(show, tab)).toEqual(expectedAction);
  });

  it('should create an action to show the search button for a tab', () => {
    const show = true;
    const tab = 'find';
    const expectedAction = { type: Actions.Navigation.ShowSearch, show, tab };
    expect(navigation.showSearch(show, tab)).toEqual(expectedAction);
  });

  it('should create an action to show the back button', () => {
    const show = true;
    const expectedAction = { type: Actions.Navigation.ShowBack, show };
    expect(navigation.showBack(show)).toEqual(expectedAction);
  });

  it('should create an action to show the search button', () => {
    const show = true;
    const expectedAction = { type: Actions.Navigation.ShowSearch, show };
    expect(navigation.showSearch(show)).toEqual(expectedAction);
  });

  it('should create an action to switch the find view', () => {
    const view = 1;
    const expectedAction = { type: Actions.Navigation.SwitchFindView, view };
    expect(navigation.switchFindView(view)).toEqual(expectedAction);
  });

  it('should create an action to switch the discover view', () => {
    const view = 1;
    const expectedAction = { type: Actions.Navigation.SwitchDiscoverView, view };
    expect(navigation.switchDiscoverView(view)).toEqual(expectedAction);
  });

  it('should create an action to switch the housing view', () => {
    const view = 1;
    const expectedAction = { type: Actions.Navigation.SwitchHousingView, view };
    expect(navigation.switchHousingView(view)).toEqual(expectedAction);
  });

  it('should show a link category', () => {
    const linkId = 'fake_id';
    const expectedAction = { type: Actions.Navigation.SwitchDiscoverLink, linkId };
    expect(navigation.switchLinkCategory(linkId)).toEqual(expectedAction);
  });

  it('should show a transit campus', () => {
    const campus = { image: 'image', name: 'name', id: 'id' };
    const expectedAction = { type: Actions.Navigation.SwitchDiscoverTransitCampus, campus };
    expect(navigation.switchTransitCampus(campus)).toEqual(expectedAction);
  });

  it('should show a residence', () => {
    const residence = { image: 'image', name: 'name', location: { latitude: 0, longitude: 0 }, props: [] };
    const expectedAction = { type: Actions.Navigation.SwitchHousingResidence, residence };
    expect(navigation.switchResidence(residence)).toEqual(expectedAction);
  });

});
