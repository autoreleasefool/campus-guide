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
 * @created 2016-11-1
 * @file DisplayUtils-test.js
 * @description Tests the functionality of DisplayUtils
 *
 */
'use strict';

// Mock translations for days
jest.mock('../../../assets/json/CoreTranslations.json', () => ({
  en: {
    monday: 'Day',
    tuesday: 'Day',
    wednesday: 'Day',
    thursday: 'Day',
    friday: 'Day',
    saturday: 'Day',
    sunday: 'Day',
  },
  fr: {
    monday: 'Day',
    tuesday: 'Day',
    wednesday: 'Day',
    thursday: 'Day',
    friday: 'Day',
    saturday: 'Day',
    sunday: 'Day',
  },
}));

// Require the modules used in testing
import * as Constants from 'Constants';
import * as DisplayUtils from '../DisplayUtils';

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
    },
  },
};

// Example object containing an icon object which describes a general icon.
const exampleObjectWithDefaultIcon = {
  icon: {
    name: 'example_name',
    class: 'example_class',
  },
};

// An object with no icon object.
const noIconObject = {
  name: 'example_name',
  class: 'example_class',
};

// An object with an invalid icon object.
const invalidIconObject = {
  icon: {
    invalid_name: 'invalid_name',
    invalid_class: 'invalid_class',
  },
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

describe('DisplayUtils-test', () => {

  it('tests retrieving facility icon names.', () => {
    for (let i = 0; i < Constants.Facilities.length; i++) {
      expect(DisplayUtils.getFacilityIconName(Constants.Facilities[i])).toBeDefined();
    }
  });

  it('tests retrieving facility icon classes.', () => {
    for (let i = 0; i < Constants.Facilities.length; i++) {
      expect(DisplayUtils.getFacilityIconClass(Constants.Facilities[i])).toBeDefined();
    }
  });

  it('tests the successful retrieval of iOS icons.', () => {
    expect(DisplayUtils.getPlatformIcon('ios', exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedIOSIcon);
    expect(DisplayUtils.getIOSIcon(exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedIOSIcon);
    expect(DisplayUtils.getIOSIcon(exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
    expect(DisplayUtils.getPlatformIcon('ios', exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
  });

  it('tests the successful retrieval of Android icons.', () => {
    expect(DisplayUtils.getPlatformIcon('android', exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedAndroidIcon);
    expect(DisplayUtils.getAndroidIcon(exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedAndroidIcon);
    expect(DisplayUtils.getAndroidIcon(exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
    expect(DisplayUtils.getPlatformIcon('android', exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
  });

  it('tests the failed retrieval of icons.', () => {
    expect(DisplayUtils.getPlatformIcon('android', noIconObject)).toBeNull();
    expect(DisplayUtils.getPlatformIcon('ios', noIconObject)).toBeNull();
    expect(DisplayUtils.getPlatformIcon('invalidPlatform', noIconObject)).toBeNull();
    expect(DisplayUtils.getAndroidIcon(noIconObject)).toBeNull();
    expect(DisplayUtils.getIOSIcon(noIconObject)).toBeNull();

    expect(DisplayUtils.getPlatformIcon('android', invalidIconObject)).toBeNull();
    expect(DisplayUtils.getPlatformIcon('ios', invalidIconObject)).toBeNull();
    expect(DisplayUtils.getPlatformIcon('invalidPlatform', invalidIconObject)).toBeNull();
    expect(DisplayUtils.getAndroidIcon(invalidIconObject)).toBeNull();
    expect(DisplayUtils.getIOSIcon(invalidIconObject)).toBeNull();
  });

  it('tests the proper recognition of light colors.', () => {
    expect(DisplayUtils.isColorDark('#ffffff')).toBeFalsy();
    expect(DisplayUtils.isColorDark('ffffff')).toBeFalsy();
    expect(DisplayUtils.isColorDark('#B2B2B2')).toBeFalsy();
    expect(DisplayUtils.isColorDark('B2B2B2')).toBeFalsy();
    expect(DisplayUtils.isColorDark('#E6DDB3')).toBeFalsy();
    expect(DisplayUtils.isColorDark('E6DDB3')).toBeFalsy();
  });

  it('tests the proper recognition of dark colors.', () => {
    expect(DisplayUtils.isColorDark('#000000')).toBeTruthy();
    expect(DisplayUtils.isColorDark('000000')).toBeTruthy();
    expect(DisplayUtils.isColorDark('#333333')).toBeTruthy();
    expect(DisplayUtils.isColorDark('333333')).toBeTruthy();
    expect(DisplayUtils.isColorDark('#611405')).toBeTruthy();
    expect(DisplayUtils.isColorDark('611405')).toBeTruthy();
  });

  it('tests retrieving social media icon names.', () => {
    for (let i = 0; i < Constants.SocialMediaPlatforms.length; i++) {
      expect(DisplayUtils.getSocialMediaIconName(Constants.SocialMediaPlatforms[i])).toBeDefined();
    }

    expect(DisplayUtils.getSocialMediaIconName('other')).toBeDefined();
  });

  it('tests retrieving social media icon colors.', () => {
    for (let i = 0; i < Constants.SocialMediaPlatforms.length; i++) {
      expect(DisplayUtils.getSocialMediaIconColor(Constants.SocialMediaPlatforms[i])).toBeDefined();
    }

    expect(DisplayUtils.getSocialMediaIconColor('other')).toBeDefined();
  });
});
