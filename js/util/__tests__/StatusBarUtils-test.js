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
 * @file StatusBarUtils-test.js
 * @description Tests the StatusBar utilities.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('StatusBarUtils');

// Sets up mocked methods for required classes
jest.setMock('StatusBar', {
  setBarStyle: jest.fn(),
});

// Example Android Platform object
const PLATFORM_ANDROID = {
  OS: 'android',
};

// Example iOS Platform object
const PLATFORM_IOS = {
  OS: 'ios',
};

// Require modules for testing
const StatusBar = require('StatusBar');
const StatusBarUtils = require('StatusBarUtils');

describe('StatusBarUtils-test', () => {

  it('tests an appropriate padding is returned based on the platform.', () => {
    expect(StatusBarUtils.getStatusBarPadding(PLATFORM_ANDROID)).toBe(0);
    expect(StatusBarUtils.getStatusBarPadding(PLATFORM_IOS)).toBeGreaterThan(0);
  });

  it('tests an appropriate theme is applied.', () => {

    // Android status bar changes should have no effect
    StatusBarUtils.setLightStatusBarIOS(PLATFORM_ANDROID, StatusBar, true);
    expect(StatusBar.setBarStyle).not.toBeCalled();
    StatusBarUtils.setLightStatusBarIOS(PLATFORM_ANDROID, StatusBar, false);
    expect(StatusBar.setBarStyle).not.toBeCalled();

    // iOS status bar changes should invoke the appropriate method
    StatusBarUtils.setLightStatusBarIOS(PLATFORM_IOS, StatusBar, true);
    expect(StatusBar.setBarStyle).toBeCalledWith('light-content');

    // Clear the StatusBar call
    StatusBar.setBarStyle.mockClear();

    // iOS status bar changes should invoke the appropriate method
    StatusBarUtils.setLightStatusBarIOS(PLATFORM_IOS, StatusBar, false);
    expect(StatusBar.setBarStyle).toBeCalledWith('default');
  });
});
