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
 * @file ScreenUtils-test.js
 * @description Tests the screen utility methods.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../../Constants');
jest.unmock('../ScreenUtils');

// Require modules for testing
const Constants = require('../../Constants');
const ScreenUtils = require('../ScreenUtils');

describe('ScreenUtils-test', () => {
  it('tests the accessing and comparing of root screens.', () => {
    expect(ScreenUtils.getRootScreen(Constants.Views.Find.Home)).toBe(Constants.Views.Find.Home);
    expect(ScreenUtils.getRootScreen(Constants.Views.Find.Search)).toBe(Constants.Views.Find.Home);
    expect(ScreenUtils.getRootScreen(Constants.Views.Schedule.Home)).toBe(Constants.Views.Schedule.Home);
    expect(ScreenUtils.getRootScreen(Constants.Views.Schedule.Editor)).toBe(Constants.Views.Schedule.Home);
    expect(ScreenUtils.getRootScreen(Constants.Views.Discover.Home)).toBe(Constants.Views.Discover.Home);
    expect(ScreenUtils.getRootScreen(Constants.Views.Discover.BusCampusList)).toBe(Constants.Views.Discover.Home);
    expect(ScreenUtils.getRootScreen(Constants.Views.Settings.Home)).toBe(Constants.Views.Settings.Home);
    expect(ScreenUtils.getRootScreen('invalid_room')).toBe(0);
  });

  it('tests whether certain screens are recognized as root screens or not.', () => {
    expect(ScreenUtils.isRootScreen(Constants.Views.Find.Home)).toBeTruthy();
    expect(ScreenUtils.isRootScreen(Constants.Views.Find.Search)).toBeFalsy();
    expect(ScreenUtils.isRootScreen(Constants.Views.Schedule.Home)).toBeTruthy();
    expect(ScreenUtils.isRootScreen(Constants.Views.Discover.BusCampusList)).toBeFalsy();
  });
});
