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
 * @file links.ts
 * @description Describes how links in the app should be searched.
 */
'use strict';

// Imports
import * as Display from '../../../util/Display';
import * as External from '../../../util/External';
import * as Translations from '../../../util/Translations';

// Types
import { SearchResult } from '../Searchable';
import { SearchSupport } from '../../../util/Search';
import { LinkSection, Section } from '../../../../typings/global';

/**
 * Returns a promise containing a list of external links and categories which match the search terms.
 *
 * @param {string}        searchTerms  the search terms for the query
 * @param {LinkSection[]} linkSections list of link sections
 * @returns {Promise<Section<SearchResult>[]>} promise which resolves with the results of the search,
 *                                             containing links
 */
async function _getResults(
    searchTerms: string,
    linkSections: LinkSection[]): Promise<Section<SearchResult>[]> {
  const links: SearchResult[] = [];
  const categories: SearchResult[] = [];

  const externalLinksTranslation = Translations.get('external_links');
  const usefulLinksTranslation = Translations.get('uo_info');

  // Method to add a link to the results
  const pushLink = (sectionName: string,
                    linkName: string,
                    iconName: string,
                    link: object,
                    matchedSectionName: boolean): void => {
    const translatedLink: string = Translations.getLink(link)
        || External.getDefaultLink();
    links.push({
      data: { link: translatedLink },
      description: sectionName,
      icon: {
        class: 'ionicon',
        name: iconName,
      },
      key: externalLinksTranslation,
      matchedTerms: matchedSectionName
          ? [ sectionName.toUpperCase(), linkName.toUpperCase() ]
          : [ linkName.toUpperCase() ],
      title: `${sectionName} - ${linkName}`,
    });
  };

  let sectionsToSearch = linkSections;

  // tslint:disable prefer-for-of
  // for-of does not account for sections added on at the end of an iteration

  for (let i = 0; i < sectionsToSearch.length; i++) {
    const section = sectionsToSearch[i];
    let sectionMatches = false;
    const sectionName: string = Translations.getName(section) || '';
    if (sectionName.toUpperCase().indexOf(searchTerms) >= 0) {
      sectionMatches = true;
      categories.push({
        data: section.id,
        description: Translations.get('see_related_links'),
        icon: section.icon,
        key: usefulLinksTranslation,
        matchedTerms: [ sectionName.toUpperCase() ],
        title: sectionName,
      });
    }

    if (section.links) {
      for (const link of section.links) {
        const linkName = Translations.getName(link) || '';
        if (sectionMatches || linkName.toUpperCase().indexOf(searchTerms) >= 0) {
          pushLink(sectionName, linkName, 'md-open', link, true);
        }
      }
    }

    if (section.social) {
      for (const link of section.social) {
        const linkName = Translations.getName(link) || '';
        if (sectionMatches || linkName.toUpperCase().indexOf(searchTerms) >= 0) {
          const iconName = Display.getSocialMediaIconName(Translations.getEnglishName(link) || '');
          pushLink(sectionName, linkName, iconName, link, true);
        }
      }
    }

    // Add subcategories to be searched
    if (section.categories) {
      for (const category of section.categories) {
        category.id = `${section.id}-${category.id}`;
      }
      sectionsToSearch = sectionsToSearch.concat(section.categories);
    }
  }

  // tslint:enable prefer-for-of

  const results = [{
    data: links,
    key: externalLinksTranslation,
  }, {
    data: categories,
    key: usefulLinksTranslation,
  }];

  return results;
}

/**
 * Returns a promise containing a list of links and link categories which match the search terms.
 *
 * @param {string}                  searchTerms the search terms for the query
 * @param {SearchSupport|undefined} data        supporting data for the query
 * @returns {Promise<Section<SearchResult>[]>} promise which resolves with the results of the search,
 *                                             containing links and categories
 */
export async function getResults(
    searchTerms: string,
    data: SearchSupport | undefined): Promise<Section<SearchResult>[]> {
  if (searchTerms.length === 0) {
      return [];
  }

  // Ensure proper supporting data is provided
  const linkSections = (data && data.linkSections) ? data.linkSections : undefined;
  if (!linkSections) {
    throw new Error('Must provide links search with data.linkSections');
  }

  // Ignore the case of the search terms
  const adjustedSearchTerms: string = searchTerms.toUpperCase();
  const results = await _getResults(adjustedSearchTerms, linkSections);

  return results;
}

/**
 * Returns an object which maps the section names to an icon which represents it.
 *
 * @returns {any} section names mapped to icon objects
 */
export function getResultIcons(): any {
  const icons = {};
  icons[Translations.get('uo_info')] = {
    icon: {
      class: 'material',
      name: 'link',
    },
  };
  icons[Translations.get('external_links')] = {
    icon: {
      class: 'ionicon',
      name: 'md-open',
    },
  };

  return icons;
}
