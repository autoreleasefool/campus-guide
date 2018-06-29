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
 * @file Translations-test.ts
 * @description Tests retrieving translations from objects.
 *
 */
'use strict';

// Require modules for testing
import * as Translations from '../Translations';

jest.setMock('../Configuration', {
  getConfig: async(config: string): Promise<any> => {
    if (getConfigShouldThrowError) {
      throw new Error('Expected error');
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
  init: async(): Promise<void> => {
    if (initShouldThrowError) {
      throw new Error('Expected error');
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

// An object with invalid details, and name values.
const invalidObject = {
  no_details: 'invalid',
  no_name: 'invalid',
};

/* Invalid language for testing. */
const invalidLanguage: any = 'invalid_language';

// Indicates if Configuration.init should throw an error
let initShouldThrowError = false;
// Indicates if Configuration.getConfig should throw an error
let getConfigShouldThrowError = false;

describe('Translations-test', () => {

  beforeEach(() => {
    initShouldThrowError = false;
    getConfigShouldThrowError = false;
  });

  it('tests invalid configuration while loading translations', async() => {
    initShouldThrowError = true;
    (await expect(async() => await Translations.loadTranslations('en'))).rejects.toThrow();
  });

  it('tests invalid configuration retrieval while loading translations', async() => {
    getConfigShouldThrowError = true;
    (await expect(async() => await Translations.loadTranslations('en'))).rejects.toThrow();
  });

  it('tests loading and unloading English translations', async() => {
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

  it('tests loading and unloading French translations', async() => {
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

  it('tests loading and unloading invalid translations', async() => {
   const invalidString: any = 'invalid';

    // Get unloaded invalid translation
    let invalid = Translations.getTranslations(invalidString);
    expect(invalid).toEqual({});

    // Load the invalid translation
    invalid = await Translations.loadTranslations(invalidString);
    expect(invalid).toEqual({});
    invalid = Translations.getTranslations(invalidString);
    expect(invalid).toEqual({});

    // Unload the translation, check again
    Translations.unloadTranslations(invalidString);
    invalid = Translations.getTranslations(invalidString);
    expect(invalid).toEqual({});
  });

  it('tests loading English translations does not affect French translations', async() => {
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

  it('tests French and English properties', async() => {
    await Translations.loadTranslations('en');
    await Translations.loadTranslations('fr');
    expect(Translations.get('language', 'en')).toEqual('English');
    expect(Translations.get('language', 'fr')).toEqual('French');
    expect(Translations.get('language', invalidLanguage)).toEqual('');
    expect(Translations.get('invalid_word', 'en')).toEqual('');
  });

  it('tests retrieving French and English descriptions.', () => {

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    expect(Translations.getEnglishDescription(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.description);
    expect(Translations.getEnglishDescription(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.description_en);
    expect(Translations.getDescription(objectWithDefaultProperties, 'en')).toBe(objectWithDefaultProperties.description);
    expect(Translations.getDescription(objectWithTranslatedProperties, 'en')).toBe(objectWithTranslatedProperties.description_en);
    expect(Translations.getDescription(invalidObject, 'en')).not.toBeDefined();

    expect(Translations.getFrenchDescription(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.description);
    expect(Translations.getFrenchDescription(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.description_fr);
    expect(Translations.getDescription(objectWithDefaultProperties, 'fr')).toBe(objectWithDefaultProperties.description);
    expect(Translations.getDescription(objectWithTranslatedProperties, 'fr')).toBe(objectWithTranslatedProperties.description_fr);
    expect(Translations.getDescription(invalidObject, 'fr')).not.toBeDefined();

    expect(Translations.getDescription(objectWithDefaultProperties, invalidLanguage)).not.toBeDefined();

    /* tslint:enable max-line-length */

  });

  it('tests retrieving French and English links.', () => {
    expect(Translations.getEnglishLink(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.link);
    expect(Translations.getEnglishLink(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.link_en);
    expect(Translations.getLink(objectWithDefaultProperties, 'en')).toBe(objectWithDefaultProperties.link);
    expect(Translations.getLink(objectWithTranslatedProperties, 'en')).toBe(objectWithTranslatedProperties.link_en);
    expect(Translations.getLink(invalidObject, 'en')).not.toBeDefined();

    expect(Translations.getFrenchLink(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.link);
    expect(Translations.getFrenchLink(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.link_fr);
    expect(Translations.getLink(objectWithDefaultProperties, 'fr')).toBe(objectWithDefaultProperties.link);
    expect(Translations.getLink(objectWithTranslatedProperties, 'fr')).toBe(objectWithTranslatedProperties.link_fr);
    expect(Translations.getLink(invalidObject, 'fr')).not.toBeDefined();

    expect(Translations.getLink(objectWithDefaultProperties, invalidLanguage)).not.toBeDefined();
  });

  it('tests retrieving French and English names.', () => {
    expect(Translations.getEnglishName(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.name);
    expect(Translations.getEnglishName(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.name_en);
    expect(Translations.getName(objectWithDefaultProperties, 'en')).toBe(objectWithDefaultProperties.name);
    expect(Translations.getName(objectWithTranslatedProperties, 'en')).toBe(objectWithTranslatedProperties.name_en);
    expect(Translations.getName(invalidObject, 'en')).not.toBeDefined();

    expect(Translations.getFrenchName(objectWithDefaultProperties)).toBe(objectWithDefaultProperties.name);
    expect(Translations.getFrenchName(objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.name_fr);
    expect(Translations.getName(objectWithDefaultProperties, 'fr')).toBe(objectWithDefaultProperties.name);
    expect(Translations.getName(objectWithTranslatedProperties, 'fr')).toBe(objectWithTranslatedProperties.name_fr);
    expect(Translations.getName(invalidObject, 'fr')).not.toBeDefined();

    expect(Translations.getName(objectWithDefaultProperties, invalidLanguage)).not.toBeDefined();
  });

  it('tests retrieving French and English variants of different properties.', () => {

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    expect(Translations.getEnglishVariant('details', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.details);
    expect(Translations.getEnglishVariant('details', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.details_en);
    expect(Translations.getFrenchVariant('details', invalidObject)).not.toBeDefined();

    expect(Translations.getFrenchVariant('details', objectWithDefaultProperties)).toBe(objectWithDefaultProperties.details);
    expect(Translations.getFrenchVariant('details', objectWithTranslatedProperties)).toBe(objectWithTranslatedProperties.details_fr);
    expect(Translations.getFrenchVariant('details', invalidObject)).not.toBeDefined();

    expect(Translations.getVariant('details', objectWithTranslatedProperties, 'en')).toBe(objectWithTranslatedProperties.details_en);
    expect(Translations.getVariant('details', objectWithTranslatedProperties, 'fr')).toBe(objectWithTranslatedProperties.details_fr);
    expect(Translations.getVariant('details', objectWithTranslatedProperties, invalidLanguage)).not.toBeDefined();

    expect(Translations.getEnglishVariant('details', undefined)).not.toBeDefined();
    expect(Translations.getFrenchVariant('details', undefined)).not.toBeDefined();

    /* tslint:enable max-line-length */

  });

  it('tests ignoring undefined and undefined properties', () => {

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    expect(Translations.getEnglishVariant('name', objectWithUndefinedProperties)).not.toBeDefined();
    expect(Translations.getEnglishVariant('details', objectWithUndefinedProperties)).toBe(objectWithUndefinedProperties.details);

    expect(Translations.getFrenchVariant('name', objectWithUndefinedProperties)).not.toBeDefined();
    expect(Translations.getFrenchVariant('details', objectWithUndefinedProperties)).toBe(objectWithUndefinedProperties.details);

    /* tslint:enable max-line-length */

  });
});
