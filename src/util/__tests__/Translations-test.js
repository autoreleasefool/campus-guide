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
 * @file Translations-test.js
 * @description Tests retrieving translations from objects.
 *
 */
'use strict';

/* eslint-disable max-len */
/* Allow tests to be on a single line for readability. */

// Require modules for testing
import * as Translations from '../Translations';

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

// An object with non-translated properties.
const objectWithDefaultProperties = {
  description: 'default_description',
  details: 'default_details',
  link: 'default_link',
  name: 'default_name',
};

// An object with translated properties in French and English.
const objectWithTranslatedProperties = {
  description_en: 'english_description',
  description_fr: 'french_description',
  details_en: 'english_details',
  details_fr: 'french_details',
  link_en: 'english_link',
  link_fr: 'french_link',
  name_en: 'english_name',
  name_fr: 'french_name',
};

// An object with undefined properties in French and English.
const objectWithUndefinedProperties = {
  details: 'test',
  details_en: undefined,
  details_fr: undefined,
  name: undefined,
  name_en: undefined,
  name_fr: undefined,
};

// An object with null properties in French and English.
const objectWithNullProperties = {
  details: 'test',
  details_en: null,
  details_fr: null,
  name: null,
  name_en: null,
  name_fr: null,
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

describe('Translations-test', () => {

  beforeEach(() => {
    initShouldThrowError = false;
    getConfigShouldThrowError = false;
  });

  it('tests invalid configuration while loading translations', async () => {
    initShouldThrowError = true;
    let errorMessage = null;

    // Load the English translation
    try {
      await Translations.loadTranslations('en');
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
      await Translations.loadTranslations('en');
    } catch (e) {
      errorMessage = e.message;
    }

    // Check the error message
    expect(errorMessage).toBe(getConfigErrorMessage);
  });

  it('tests loading and unloading English translations', async () => {
    // Get unloaded English translation
    let en = Translations.getTranslations('en');
    expect(en).toEqual({});

    // Load the English translation
    en = await Translations.loadTranslations('en');
    expect(en.language).toBe('English');
    en = Translations.getTranslations('en');
    expect(en.language).toBe('English');

    // Load the already loaded English translation
    en = await Translations.loadTranslations('en');
    expect(en.language).toBe('English');

    // Unload the translation, check again
    Translations.unloadTranslations('en');
    en = Translations.getTranslations('en');
    expect(en).toEqual({});
  });

  it('tests loading and unloading French translations', async () => {
    // Get unloaded French translation
    let fr = Translations.getTranslations('fr');
    expect(fr).toEqual({});

    // Load the French translation
    fr = await Translations.loadTranslations('fr');
    expect(fr.language).toBe('French');
    fr = Translations.getTranslations('fr');
    expect(fr.language).toBe('French');

    // Load the already loaded French translation
    fr = await Translations.loadTranslations('fr');
    expect(fr.language).toBe('French');

    // Unload the translation, check again
    Translations.unloadTranslations('fr');
    fr = Translations.getTranslations('fr');
    expect(fr).toEqual({});
  });

  it('tests loading and unloading invalid translations', async () => {
    // Get unloaded invalid translation
    let invalid = Translations.getTranslations('invalid');
    expect(invalid).toEqual({});

    // Load the invalid translation
    invalid = await Translations.loadTranslations('invalid');
    expect(invalid).toEqual({});
    invalid = Translations.getTranslations('invalid');
    expect(invalid).toEqual({});

    // Unload the translation, check again
    Translations.unloadTranslations('invalid');
    invalid = Translations.getTranslations('invalid');
    expect(invalid).toEqual({});
  });

  it('tests loading English translations does not affect French translations', async () => {
    // Get unloaded French translation
    let fr = Translations.getTranslations('fr');
    expect(fr).toEqual({});

    // Get unloaded English translation
    let en = Translations.getTranslations('en');
    expect(en).toEqual({});

    // Load the English translation
    en = await Translations.loadTranslations('en');
    expect(en.language).toBe('English');
    en = Translations.getTranslations('en');
    expect(en.language).toBe('English');

    // Get unloaded French translation
    fr = Translations.getTranslations('fr');
    expect(fr).toEqual({});

    // Load the French translation
    fr = await Translations.loadTranslations('fr');
    expect(fr.language).toBe('French');
    fr = Translations.getTranslations('fr');
    expect(fr.language).toBe('French');

    // Unload the English translation, check both
    Translations.unloadTranslations('en');
    en = Translations.getTranslations('en');
    expect(en).toEqual({});

    fr = Translations.getTranslations('fr');
    expect(fr.language).toBe('French');
  });

  it('tests French and English properties', async () => {
    await Translations.loadTranslations('en');
    await Translations.loadTranslations('fr');
    expect(Translations.get('en', 'language')).toEqual('English');
    expect(Translations.get('fr', 'language')).toEqual('French');
    expect(Translations.get('invalid_language', 'language')).toEqual('');
    expect(Translations.get('en', 'invalid_word')).toEqual('');
  });

  it('tests retrieving French and English descriptions.', () => {
    expect(Translations.getEnglishDescription(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.description);
    expect(Translations.getEnglishDescription(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.description_en);
    expect(Translations.getDescription('en', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.description);
    expect(Translations.getDescription('en', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.description_en);
    expect(Translations.getDescription('en', invalidObject)).toBeNull();

    expect(Translations.getFrenchDescription(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.description);
    expect(Translations.getFrenchDescription(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.description_fr);
    expect(Translations.getDescription('fr', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.description);
    expect(Translations.getDescription('fr', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.description_fr);
    expect(Translations.getDescription('fr', invalidObject)).toBeNull();

    expect(Translations.getDescription('invalid_language', objectWithDefaultProperties)).toBeNull();
  });

  it('tests retrieving French and English links.', () => {
    expect(Translations.getEnglishLink(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.link);
    expect(Translations.getEnglishLink(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.link_en);
    expect(Translations.getLink('en', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.link);
    expect(Translations.getLink('en', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.link_en);
    expect(Translations.getLink('en', invalidObject)).toBeNull();

    expect(Translations.getFrenchLink(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.link);
    expect(Translations.getFrenchLink(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.link_fr);
    expect(Translations.getLink('fr', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.link);
    expect(Translations.getLink('fr', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.link_fr);
    expect(Translations.getLink('fr', invalidObject)).toBeNull();

    expect(Translations.getLink('invalid_language', objectWithDefaultProperties)).toBeNull();
  });

  it('tests retrieving French and English names.', () => {
    expect(Translations.getEnglishName(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.name);
    expect(Translations.getEnglishName(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.name_en);
    expect(Translations.getName('en', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.name);
    expect(Translations.getName('en', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.name_en);
    expect(Translations.getName('en', invalidObject)).toBeNull();

    expect(Translations.getFrenchName(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.name);
    expect(Translations.getFrenchName(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.name_fr);
    expect(Translations.getName('fr', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.name);
    expect(Translations.getName('fr', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.name_fr);
    expect(Translations.getName('fr', invalidObject)).toBeNull();

    expect(Translations.getName('invalid_language', objectWithDefaultProperties)).toBeNull();
  });

  it('tests retrieving French and English variants of different properties.', () => {
    expect(Translations.getEnglishVariant('details', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.details);
    expect(Translations.getEnglishVariant('details', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.details_en);
    expect(Translations.getFrenchVariant('details', invalidObject)).toBeNull();

    expect(Translations.getFrenchVariant('details', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.details);
    expect(Translations.getFrenchVariant('details', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.details_fr);
    expect(Translations.getFrenchVariant('details', invalidObject)).toBeNull();

    expect(Translations.getVariant('en', 'details', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.details_en);
    expect(Translations.getVariant('fr', 'details', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.details_fr);
    expect(Translations.getVariant('invalid_language', 'details', objectWithTranslatedProperties)).toBeNull();

    expect(Translations.getEnglishVariant('details', null)).toBeNull();
    expect(Translations.getFrenchVariant('details', null)).toBeNull();
  });

  it('tests ignoring undefined and null properties', () => {
    expect(Translations.getEnglishVariant('name', objectWithUndefinedProperties)).toBeNull();
    expect(Translations.getEnglishVariant('details', objectWithUndefinedProperties)).toBe(objectWithUndefinedProperties.details);

    expect(Translations.getEnglishVariant('name', objectWithNullProperties)).toBeNull();
    expect(Translations.getEnglishVariant('details', objectWithNullProperties)).toBe(objectWithUndefinedProperties.details);

    expect(Translations.getFrenchVariant('name', objectWithUndefinedProperties)).toBeNull();
    expect(Translations.getFrenchVariant('details', objectWithUndefinedProperties)).toBe(objectWithUndefinedProperties.details);

    expect(Translations.getFrenchVariant('name', objectWithNullProperties)).toBeNull();
    expect(Translations.getFrenchVariant('details', objectWithNullProperties)).toBe(objectWithUndefinedProperties.details);
  });
});
