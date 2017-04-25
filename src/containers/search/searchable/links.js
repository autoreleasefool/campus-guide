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
 * @created 2016-11-16
 * @file links.js
 * @description Describes how links in the app should be searched.
 *
 * @flow
 */
'use strict';

// Types
import type { Language, LinkSection } from 'types';
import type { SearchResult } from '../Searchable';

// Imports
import Promise from 'promise';
import * as Configuration from 'Configuration';
import * as DisplayUtils from 'DisplayUtils';
import * as ExternalUtils from 'ExternalUtils';
import * as Translations from 'Translations';

/**
 * Returns a promise containing a list of external links and categories which match the search terms.
 *
 * @param {Language}           language     the current language
 * @param {string}             searchTerms  the search terms for the query.
 * @param {Array<LinkSection>} linkSections list of link sections
 * @returns {Promise<Object>} promise which resolves with the results of the search, containing links
 */
function _getResults(language: Language,
                     searchTerms: string,
                     linkSections: Array < LinkSection >): Promise < Object > {
  return new Promise((resolve) => {
    const links: Array < SearchResult > = [];
    const categories: Array < SearchResult > = [];

    // Method to add a link to the results
    const pushLink = (sectionName: string,
                      linkName: string,
                      iconName: string,
                      link: Object,
                      matchedSectionName: boolean) => {
      const translatedLink: string = Translations.getVariant(language, 'link', link)
          || ExternalUtils.getDefaultLink();
      links.push({
        description: sectionName,
        data: { link: translatedLink, language: language },
        icon: {
          name: iconName,
          class: 'ionicon',
        },
        matchedTerms: matchedSectionName
            ? [ sectionName.toUpperCase(), linkName.toUpperCase() ]
            : [ linkName.toUpperCase() ],
        title: linkName,
      });
    };

    let sectionsToSearch = linkSections;
    for (let i = 0; i < sectionsToSearch.length; i++) {
      const section = sectionsToSearch[i];
      const sectionName: string = Translations.getName(language, section) || '';

      if (sectionName.toUpperCase().indexOf(searchTerms) >= 0) {
        categories.push({
          description: Translations.get(language, 'see_related_links'),
          data: section.id,
          icon: section.icon,
          matchedTerms: [ sectionName.toUpperCase() ],
          title: sectionName,
        });

        if (section.links) {
          for (let j = 0; j < section.links.length; j++) {
            const link = section.links[j];
            const linkName = Translations.getName(language, link) || '';
            pushLink(sectionName, linkName, 'md-open', link, true);
          }
        }

        if (section.social) {
          for (let j = 0; j < section.social.length; j++) {
            const link = section.social[j];
            const linkName = Translations.getName(language, link) || '';
            const iconName = DisplayUtils.getSocialMediaIconName(Translations.getEnglishName(link) || '');
            pushLink(sectionName, linkName, iconName, link, true);
          }
        }
      } else {
        if (section.links) {
          for (let j = 0; j < section.links.length; j++) {
            const link = section.links[j];
            const linkName = Translations.getName(language, link) || '';
            if (linkName.toUpperCase().indexOf(searchTerms) >= 0) {
              pushLink(sectionName, linkName, 'md-open', link, false);
            }
          }
        }

        if (section.social) {
          for (let j = 0; j < section.social.length; j++) {
            const link = section.social[j];
            const linkName = Translations.getName(language, link) || '';
            if (linkName.toUpperCase().indexOf(searchTerms) >= 0) {
              const iconName = DisplayUtils.getSocialMediaIconName(Translations.getEnglishName(link) || '');
              pushLink(sectionName, linkName, iconName, link, false);
            }
          }
        }
      }

      // Add subcategories to be searched
      if (section.categories) {
        for (let j = 0; j < section.categories.length; j++) {
          section.categories[j].id = `${section.id}-${section.categories[j].id}`;
        }
        sectionsToSearch = sectionsToSearch.concat(section.categories);
      }
    }

    const results = {};
    results[Translations.get(language, 'external_links')] = links;
    results[Translations.get(language, 'useful_links')] = categories;
    resolve(results);
  });
}

/**
 * Returns a promise containing a list of links and link categories which match the search terms.
 *
 * @param {Language} language    the current language
 * @param {?string}  searchTerms the search terms for the query.
 * @returns {Promise<Object>} promise which resolves with the results of the search, containing links and categories
 */
export function getResults(language: Language, searchTerms: ?string): Promise < Object > {
  return new Promise((resolve, reject) => {
    if (searchTerms == null || searchTerms.length === 0) {
      resolve({});
      return;
    }

    // Ignore the case of the search terms
    const adjustedSearchTerms: string = searchTerms.toUpperCase();

    Configuration.init()
        .then(() => Configuration.getConfig('/useful_links.json'))
        .then((linkSections: Array < LinkSection >) => _getResults(language, adjustedSearchTerms, linkSections))
        .then((results: Array < Object >) => resolve(results))
        .catch((err: any) => {
          console.error('Configuration could not be initialized for useful links search.', err);
          reject(err);
        });
  });
}

/**
 * Returns an object which maps the section names to an icon which represents it.
 *
 * @param {Language} language the current language
 * @returns {Object} section names mapped to icon objects
 */
export function getResultIcons(language: Language): Object {
  const icons = {};
  icons[Translations.get(language, 'useful_links')] = {
    icon: {
      class: 'material',
      name: 'link',
    },
  };
  icons[Translations.get(language, 'external_links')] = {
    icon: {
      class: 'ionicon',
      name: 'md-open',
    },
  };

  return icons;
}
