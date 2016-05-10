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
 * @file DisplayUtils_testGetIcons.js
 * @description Test the retrieval of icons.
 *
 */
'use strict';

jest.unmock('../DisplayUtils');

// Example object containing an icon object which describes the android and iOS icons.
const exampleObjectWithPlatformSpecificIcons = {
  icon: {
    android: {
      name: 'android_example_name',
      class: 'android_example_class',
    },
    ios: {
      name: 'ios_example_name',
      class: 'ios_example_class',
    }
  },
};

// Example object containing an icon object which describes a general icon.
const exampleObjectWithDefaultIcon = {
  icon: {
    name: 'example_name',
    class: 'example_class',
  }
};

// An object with no icon object.
const invalidIconObject = {
  name: 'example_name',
  class: 'example_class',
};

// The expected icon to be returned for the Android platform.
const expectedAndroidIcon = {
  name: 'android_example_name',
  class: 'android_example_class',
};

// The expected icon to be returned for the iOS platform.
const expectedIOSIcon = {
  name: 'ios_example_name',
  class: 'ios_example_class',
};

// The expected default icon to be returned.
const expectedDefaultIcon = {
  name: 'example_name',
  class: 'example_class',
};

describe('testGetIcons', () => {
  it('tests the successful retrieval of iOS icons', () => {
    const DisplayUtils = require('../DisplayUtils');

    expect(DisplayUtils.getPlatformIcon('ios', exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedIOSIcon);
    expect(DisplayUtils.getIOSIcon(exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedIOSIcon);
    expect(DisplayUtils.getIOSIcon(exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
    expect(DisplayUtils.getPlatformIcon('ios', exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
  });

  it('tests the successful retrieval of Android icons', () => {
    const DisplayUtils = require('../DisplayUtils');

    expect(DisplayUtils.getPlatformIcon('android', exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedAndroidIcon);
    expect(DisplayUtils.getAndroidIcon(exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedAndroidIcon);
    expect(DisplayUtils.getAndroidIcon(exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
    expect(DisplayUtils.getPlatformIcon('android', exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
  });

  it('tests the failed retrieval of icons', () => {
    const DisplayUtils = require('../DisplayUtils');

    expect(DisplayUtils.getPlatformIcon('android', invalidIconObject)).toBeNull();
    expect(DisplayUtils.getPlatformIcon('ios', invalidIconObject)).toBeNull();
    expect(DisplayUtils.getPlatformIcon('invalidPlatform', invalidIconObject)).toBeNull();
    expect(DisplayUtils.getAndroidIcon(invalidIconObject)).toBeNull();
    expect(DisplayUtils.getIOSIcon(invalidIconObject)).toBeNull();
  });
});
