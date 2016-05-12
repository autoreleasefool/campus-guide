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

// An object with invalid details, link, and name values.
const invalidObject = {
  no_details: "invalid",
  no_link: "invalid",
  no_name: "invalid",
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
    expect(LanguageUtils.getTranslatedName('en', invalidObject))
        .toBeNull();

    expect(LanguageUtils.getFrenchName(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils.getFrenchName(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
    expect(LanguageUtils.getTranslatedName('fr', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils.getTranslatedName('fr', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
    expect(LanguageUtils.getTranslatedName('fr', invalidObject))
        .toBeNull();

    expect(LanguageUtils.getTranslatedName('invalid_language', objectWithDefaultProperties))
        .toBeNull();
  });

  it('tests retrieving French and English links.', () => {
    const LanguageUtils = require('../LanguageUtils');

    expect(LanguageUtils.getEnglishLink(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.link);
    expect(LanguageUtils.getEnglishLink(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.link_en);
    expect(LanguageUtils.getTranslatedLink('en', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.link);
    expect(LanguageUtils.getTranslatedLink('en', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.link_en);
    expect(LanguageUtils.getTranslatedLink('en', invalidObject))
        .toBeNull();

    expect(LanguageUtils.getFrenchLink(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.link);
    expect(LanguageUtils.getFrenchLink(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.link_fr);
    expect(LanguageUtils.getTranslatedLink('fr', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.link);
    expect(LanguageUtils.getTranslatedLink('fr', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.link_fr);
    expect(LanguageUtils.getTranslatedLink('fr', invalidObject))
        .toBeNull();

    expect(LanguageUtils.getTranslatedLink('invalid_language', objectWithDefaultProperties))
        .toBeNull();
  });

  it('tests retrieving French and English details.', () => {
    const LanguageUtils = require('../LanguageUtils');

    expect(LanguageUtils.getEnglishDetails(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.details);
    expect(LanguageUtils.getEnglishDetails(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_en);
    expect(LanguageUtils.getTranslatedDetails('en', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.details);
    expect(LanguageUtils.getTranslatedDetails('en', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_en);
    expect(LanguageUtils.getTranslatedDetails('en', invalidObject))
        .toBeNull();

    expect(LanguageUtils.getFrenchDetails(objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.details);
    expect(LanguageUtils.getFrenchDetails(objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_fr);
    expect(LanguageUtils.getTranslatedDetails('fr', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.details);
    expect(LanguageUtils.getTranslatedDetails('fr', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.details_fr);
    expect(LanguageUtils.getTranslatedDetails('fr', invalidObject))
        .toBeNull();

    expect(LanguageUtils.getTranslatedDetails('invalid_language', objectWithDefaultProperties))
        .toBeNull();
  });

  it('tests retrieving French and English variants of different properties.', () => {
    const LanguageUtils = require('../LanguageUtils');

    expect(LanguageUtils._getEnglishVariant('name', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils._getEnglishVariant('name', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_en);
    expect(LanguageUtils._getFrenchVariant('name', invalidObject))
        .toBeNull();

    expect(LanguageUtils._getFrenchVariant('name', objectWithDefaultProperties))
        .toBe(objectWithDefaultProperties.name);
    expect(LanguageUtils._getFrenchVariant('name', objectWithTranslatedProperties))
        .toBe(objectWithTranslatedProperties.name_fr);
    expect(LanguageUtils._getFrenchVariant('name', invalidObject))
        .toBeNull();

    expect(LanguageUtils._getEnglishVariant('name', null))
        .toBeNull();
    expect(LanguageUtils._getFrenchVariant('name', null))
        .toBeNull();
  });
});
