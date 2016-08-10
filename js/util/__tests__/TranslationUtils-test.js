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
 * @file TranslationUtils-test.js
 * @description Tests retrieving translations from objects.
 *
 */
'use strict';

// Unmock modules so the real module is used.
jest.unmock('TranslationUtils');

// An object with non-translated properties.
const objectWithDefaultProperties = {
  details: 'default_details',
  name: 'default_name',
};

// An object with translated properties in French and English.
const objectWithTranslatedProperties = {
  details_en: 'english_details',
  details_fr: 'french_details',
  name_en: 'english_name',
  name_fr: 'french_name',
};

// An object with invalid details, and name values.
const invalidObject = {
  no_details: 'invalid',
  no_name: 'invalid',
};

// Require modules for testing
const TranslationUtils = require('TranslationUtils');

describe('TranslationUtils-test', () => {

  it('tests retrieving French and English names.', () => {
    expect(TranslationUtils.getEnglishName(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(TranslationUtils.getEnglishName(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_en);
    expect(TranslationUtils.getTranslatedName('en', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(TranslationUtils.getTranslatedName('en', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_en);
    expect(TranslationUtils.getTranslatedName('en', invalidObject))
        .toBeNull();

    expect(TranslationUtils.getFrenchName(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(TranslationUtils.getFrenchName(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
    expect(TranslationUtils.getTranslatedName('fr', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(TranslationUtils.getTranslatedName('fr', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
    expect(TranslationUtils.getTranslatedName('fr', invalidObject))
        .toBeNull();

    expect(TranslationUtils.getTranslatedName('invalid_language', objectWithDefaultProperties))
        .toBeNull();
  });

  it('tests retrieving French and English variants of different properties.', () => {
    expect(TranslationUtils.getEnglishVariant('details', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.details);
    expect(TranslationUtils.getEnglishVariant('details', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_en);
    expect(TranslationUtils.getFrenchVariant('details', invalidObject))
        .toBeNull();

    expect(TranslationUtils.getFrenchVariant('details', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.details);
    expect(TranslationUtils.getFrenchVariant('details', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_fr);
    expect(TranslationUtils.getFrenchVariant('details', invalidObject))
        .toBeNull();

    expect(TranslationUtils.getTranslatedVariant('en', 'details', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_en);
    expect(TranslationUtils.getTranslatedVariant('fr', 'details', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_fr);
    expect(TranslationUtils.getTranslatedVariant('invalid_language', 'details', objectWithTranslatedProperties))
        .toBeNull();

    expect(TranslationUtils.getEnglishVariant('details', null))
        .toBeNull();
    expect(TranslationUtils.getFrenchVariant('details', null))
        .toBeNull();
  });
});
