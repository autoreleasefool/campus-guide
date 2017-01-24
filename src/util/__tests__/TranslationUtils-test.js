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
 * @file TranslationUtils-test.js
 * @description Tests retrieving translations from objects.
 *
 */
'use strict';

/* async seems to cause an issue with this rule. */

// Require modules for testing
import * as TranslationUtils from '../TranslationUtils';

jest.setMock('Configuration', {
  init: async function init() {
    if (initShouldThrowError) {
      throw new Error(initErrorMessage);
    }
  },
  getConfig: async function getConfig(config) {
    if (getConfigShouldThrowError) {
      throw new Error(getConfigErrorMessage);
    }

    if (config.indexOf('.en') >= 0) {
      return {
        language: 'English',
      };
    } else if (config.indexOf('.fr') >= 0) {
      return {
        language: 'French',
      };
    } else {
      return {};
    }
  },
});

// Mock translations for days
jest.setMock('../../../assets/json/CoreTranslations.json', {
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
});

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

// Error message for when Configuration.init fails
const initErrorMessage = 'Init error. This error is being thrown for testing purposes.';
// Error message for when Configuration.getConfig fails
const getConfigErrorMessage = 'getConfig error. This error is being thrown for testing purposes.';

// Indicates if Configuration.init should throw an error
let initShouldThrowError: boolean = false;
// Indicates if Configuration.getConfig should throw an error
let getConfigShouldThrowError: boolean = false;

describe('TranslationUtils-test', () => {

  beforeEach(() => {
    initShouldThrowError = false;
    getConfigShouldThrowError = false;
  });

  it('tests that converting a number to a day returns a valid value', () => {
    const NUMBER_OF_DAYS = 7;
    for (let i = 0; i < NUMBER_OF_DAYS; i++) {
      expect(TranslationUtils.numberToDay('en', i)).toBe('Day');
      expect(TranslationUtils.numberToDay('fr', i)).toBe('Day');
    }

    expect(TranslationUtils.numberToDay('en', -1)).toBeNull();
    expect(TranslationUtils.numberToDay('fr', -1)).toBeNull();
  });

  it('tests invalid configuration while loading translations', async () => {
    initShouldThrowError = true;
    let errorMessage = null;

    // Load the English translation
    try {
      await TranslationUtils.loadTranslations('en');
    } catch (e) {
      errorMessage = e.message;
    }

    // Check the error message
    expect(errorMessage).toBe(initErrorMessage);
  });

  it('tests invalid configuration retrieval while loading translations', async () => {
    getConfigShouldThrowError = true;
    let errorMessage = null;

    // Load the English translation
    try {
      await TranslationUtils.loadTranslations('en');
    } catch (e) {
      errorMessage = e.message;
    }

    // Check the error message
    expect(errorMessage).toBe(getConfigErrorMessage);
  });

  it('tests loading and unloading English translations', async () => {
    // Get unloaded English translation
    let en = TranslationUtils.getTranslations('en');
    expect(en).toEqual({});

    // Load the English translation
    en = await TranslationUtils.loadTranslations('en');
    expect(en.language).toBe('English');
    en = TranslationUtils.getTranslations('en');
    expect(en.language).toBe('English');

    // Load the already loaded English translation
    en = await TranslationUtils.loadTranslations('en');
    expect(en.language).toBe('English');

    // Unload the translation, check again
    TranslationUtils.unloadTranslations('en');
    en = TranslationUtils.getTranslations('en');
    expect(en).toEqual({});
  });

  it('tests loading and unloading French translations', async () => {
    // Get unloaded French translation
    let fr = TranslationUtils.getTranslations('fr');
    expect(fr).toEqual({});

    // Load the French translation
    fr = await TranslationUtils.loadTranslations('fr');
    expect(fr.language).toBe('French');
    fr = TranslationUtils.getTranslations('fr');
    expect(fr.language).toBe('French');

    // Load the already loaded French translation
    fr = await TranslationUtils.loadTranslations('fr');
    expect(fr.language).toBe('French');

    // Unload the translation, check again
    TranslationUtils.unloadTranslations('fr');
    fr = TranslationUtils.getTranslations('fr');
    expect(fr).toEqual({});
  });

  it('tests loading and unloading invalid translations', async () => {
    // Get unloaded invalid translation
    let invalid = TranslationUtils.getTranslations('invalid');
    expect(invalid).toEqual({});

    // Load the invalid translation
    invalid = await TranslationUtils.loadTranslations('invalid');
    expect(invalid).toEqual({});
    invalid = TranslationUtils.getTranslations('invalid');
    expect(invalid).toEqual({});

    // Unload the translation, check again
    TranslationUtils.unloadTranslations('invalid');
    invalid = TranslationUtils.getTranslations('invalid');
    expect(invalid).toEqual({});
  });

  it('tests loading English translations does not affect French translations', async () => {
    // Get unloaded French translation
    let fr = TranslationUtils.getTranslations('fr');
    expect(fr).toEqual({});

    // Get unloaded English translation
    let en = TranslationUtils.getTranslations('en');
    expect(en).toEqual({});

    // Load the English translation
    en = await TranslationUtils.loadTranslations('en');
    expect(en.language).toBe('English');
    en = TranslationUtils.getTranslations('en');
    expect(en.language).toBe('English');

    // Get unloaded French translation
    fr = TranslationUtils.getTranslations('fr');
    expect(fr).toEqual({});

    // Load the French translation
    fr = await TranslationUtils.loadTranslations('fr');
    expect(fr.language).toBe('French');
    fr = TranslationUtils.getTranslations('fr');
    expect(fr.language).toBe('French');

    // Unload the English translation, check both
    TranslationUtils.unloadTranslations('en');
    en = TranslationUtils.getTranslations('en');
    expect(en).toEqual({});

    fr = TranslationUtils.getTranslations('fr');
    expect(fr.language).toBe('French');
  });

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
