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
 * @file DisplayUtils_testSocialMediaIcons.js
 * @description Tests retrieving social media icons and colors.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../DisplayUtils');

// List of social media platforms to test.
const SOCIAL_MEDIA_PLATFORMS = [
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'youtube',
  'tumblr',
  'other',
];

describe('testSocialMediaIcons', () => {
  it('tests retrieving social media icon names.', () => {
    const DisplayUtils = require('../DisplayUtils');

    for (const socialMedia in SOCIAL_MEDIA_PLATFORMS) {
      if ({}.hasOwnProperty(SOCIAL_MEDIA_PLATFORMS, socialMedia)) {
        expect(DisplayUtils.getSocialMediaIconName(SOCIAL_MEDIA_PLATFORMS[socialMedia])).toBeDefined();
      }
    }
  });

  it('tests retrieving social media icon colors.', () => {
    const DisplayUtils = require('../DisplayUtils');

    for (const socialMedia in SOCIAL_MEDIA_PLATFORMS) {
      if ({}.hasOwnProperty(SOCIAL_MEDIA_PLATFORMS, socialMedia)) {
        expect(DisplayUtils.getSocialMediaIconColor(SOCIAL_MEDIA_PLATFORMS[socialMedia])).toBeDefined();
      }
    }
  });
});
