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
 * @created 2016-11-1
 * @file Display-test.ts
 * @description Tests the functionality of the Display utility class
 *
 */
'use strict';

// Mock translations for days
jest.mock('../../../assets/json/CoreTranslations.json', () => ({
  en: {
    friday: 'Day',
    monday: 'Day',
    saturday: 'Day',
    sunday: 'Day',
    thursday: 'Day',
    tuesday: 'Day',
    wednesday: 'Day',
  },
  fr: {
    friday: 'Jour',
    monday: 'Jour',
    saturday: 'Jour',
    sunday: 'Jour',
    thursday: 'Jour',
    tuesday: 'Jour',
    wednesday: 'Jour',
  },
}));

// Require the modules used in testing
import * as Constants from '../../constants';
import * as Display from '../Display';

// Example object containing an icon object which describes the android and iOS icons.
const exampleObjectWithPlatformSpecificIcons = {
  icon: {
    android: {
      class: 'android_example_class',
      name: 'android_example_name',
    },
    ios: {
      class: 'ios_example_class',
      name: 'ios_example_name',
    },
  },
};

// Example object containing an icon object which describes a general icon.
const exampleObjectWithDefaultIcon = {
  icon: {
    class: 'example_class',
    name: 'example_name',
  },
};

// An object with no icon object.
const noIconObject = {
  class: 'example_class',
  name: 'example_name',
};

// An object with an invalid icon object.
const invalidIconObject = {
  icon: {
    invalid_class: 'invalid_class',
    invalid_name: 'invalid_name',
  },
};

// The expected icon to be returned for the Android platform.
const expectedAndroidIcon = {
  class: 'android_example_class',
  name: 'android_example_name',
};

// The expected icon to be returned for the iOS platform.
const expectedIOSIcon = {
  class: 'ios_example_class',
  name: 'ios_example_name',
};

// The expected default icon to be returned.
const expectedDefaultIcon = {
  class: 'example_class',
  name: 'example_name',
};

describe('Display-test', () => {

  it('tests retrieving facility icon names.', () => {
    for (const facility of Constants.Facilities) {
      if (facility === 'invalid') {
        expect(Display.getFacilityIconName(facility)).not.toBeDefined();
      } else {
        expect(Display.getFacilityIconName(facility)).toBeDefined();
      }
    }
  });

  it('tests retrieving facility icon classes.', () => {
    for (const facility of Constants.Facilities) {
      if (facility === 'invalid') {
        expect(Display.getFacilityIconClass(facility)).not.toBeDefined();
      } else {
        expect(Display.getFacilityIconClass(facility)).toBeDefined();
      }
    }
  });

  it('tests the successful retrieval of iOS icons.', () => {
    expect(Display.getPlatformIcon('ios', exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedIOSIcon);
    expect(Display.getIOSIcon(exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedIOSIcon);
    expect(Display.getIOSIcon(exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
    expect(Display.getPlatformIcon('ios', exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
  });

  it('tests the successful retrieval of Android icons.', () => {
    expect(Display.getPlatformIcon('android', exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedAndroidIcon);
    expect(Display.getAndroidIcon(exampleObjectWithPlatformSpecificIcons))
        .toEqual(expectedAndroidIcon);
    expect(Display.getAndroidIcon(exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
    expect(Display.getPlatformIcon('android', exampleObjectWithDefaultIcon))
        .toEqual(expectedDefaultIcon);
  });

  it('tests the failed retrieval of icons.', () => {
    const invalidPlatform: any = 'invalidPlatform';

    expect(Display.getPlatformIcon('android', noIconObject)).not.toBeDefined();
    expect(Display.getPlatformIcon('ios', noIconObject)).not.toBeDefined();
    expect(Display.getPlatformIcon(invalidPlatform, noIconObject)).not.toBeDefined();
    expect(Display.getAndroidIcon(noIconObject)).not.toBeDefined();
    expect(Display.getIOSIcon(noIconObject)).not.toBeDefined();

    expect(Display.getPlatformIcon('android', invalidIconObject)).not.toBeDefined();
    expect(Display.getPlatformIcon('ios', invalidIconObject)).not.toBeDefined();
    expect(Display.getPlatformIcon(invalidPlatform, invalidIconObject)).not.toBeDefined();
    expect(Display.getAndroidIcon(invalidIconObject)).not.toBeDefined();
    expect(Display.getIOSIcon(invalidIconObject)).not.toBeDefined();
  });

  it('tests the proper recognition of light colors.', () => {
    expect(Display.isColorDark('#ffffff')).toBeFalsy();
    expect(Display.isColorDark('ffffff')).toBeFalsy();
    expect(Display.isColorDark('#B2B2B2')).toBeFalsy();
    expect(Display.isColorDark('B2B2B2')).toBeFalsy();
    expect(Display.isColorDark('#E6DDB3')).toBeFalsy();
    expect(Display.isColorDark('E6DDB3')).toBeFalsy();
  });

  it('tests the proper recognition of dark colors.', () => {
    expect(Display.isColorDark('#000000')).toBeTruthy();
    expect(Display.isColorDark('000000')).toBeTruthy();
    expect(Display.isColorDark('#333333')).toBeTruthy();
    expect(Display.isColorDark('333333')).toBeTruthy();
    expect(Display.isColorDark('#611405')).toBeTruthy();
    expect(Display.isColorDark('611405')).toBeTruthy();
  });

  it('tests retrieving social media icon names.', () => {
    for (const platform of Constants.SocialMediaPlatforms) {
      expect(Display.getSocialMediaIconName(platform)).toBeDefined();
    }

    expect(Display.getSocialMediaIconName('other')).toBeDefined();
  });

  it('tests retrieving social media icon colors.', () => {
    for (const platform of Constants.SocialMediaPlatforms) {
      expect(Display.getSocialMediaIconColor(platform)).toBeDefined();
    }

    expect(Display.getSocialMediaIconColor('other')).toBeDefined();
  });
});
