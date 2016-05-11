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
 * @file LanguageUtils_testGetTranslations.js
 * @description Tests retrieving translations from objects.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('../LanguageUtils');

// An object with non-translated properties.
const objectWithDefaultProperties = {
  details: 'default_detals',
  link: 'default_link',
  name: 'default_name',
};

// An object with translated properties in French and English.
const objectWithTranslatedProperties = {
  details_en: 'english_details',
  details_fr: 'french_details',
  link_en: 'english_link',
  link_fr: 'french_link',
  name_en: 'english_name',
  name_fr: 'french_name',
};

describe('testGetTranslations', () => {
  it('tests retrieving French and English names.', () => {
    const LanguageUtils = require('../LanguageUtils');


    expect(LanguageUtils.getEnglishName(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils.getEnglishName(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_en);
    expect(LanguageUtils.getTranslatedName('en', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils.getTranslatedName('en', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_en);

    expect(LanguageUtils.getFrenchName(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils.getFrenchName(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
    expect(LanguageUtils.getTranslatedName('fr', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils.getTranslatedName('fr', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
  });
});
