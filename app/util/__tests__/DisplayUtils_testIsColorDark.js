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
 * @file DisplayUtils_testIsColorDark.js
 * @description Tests the validity of the method isColorDark for determining if a color is light or dark.
 *
 */
'use strict';

jest.unmock('../DisplayUtils');

describe('testIsColorDark', () => {
  it('tests light colors.', () => {
    const DisplayUtils = require('../DisplayUtils');

    expect(DisplayUtils.isColorDark('#ffffff')).toBeFalsy();
    expect(DisplayUtils.isColorDark('ffffff')).toBeFalsy();
    expect(DisplayUtils.isColorDark('#B2B2B2')).toBeFalsy();
    expect(DisplayUtils.isColorDark('B2B2B2')).toBeFalsy();
    expect(DisplayUtils.isColorDark('#E6DDB3')).toBeFalsy();
    expect(DisplayUtils.isColorDark('E6DDB3')).toBeFalsy();
  });

  it('tests dark colors.', () => {
    const DisplayUtils = require('../DisplayUtils');

    expect(DisplayUtils.isColorDark('#000000')).toBeTruthy();
    expect(DisplayUtils.isColorDark('000000')).toBeTruthy();
    expect(DisplayUtils.isColorDark('#333333')).toBeTruthy();
    expect(DisplayUtils.isColorDark('333333')).toBeTruthy();
    expect(DisplayUtils.isColorDark('#611405')).toBeTruthy();
    expect(DisplayUtils.isColorDark('611405')).toBeTruthy();
  })
});
