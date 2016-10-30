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
 * @created 2016-10-30
 * @file discover-test.js
 * @description Tests discover actions
 *
 */
'use strict';

// Imports
import * as actions from '../discover';

describe('discover actions', () => {
  it('should create an action to switch the discover view', () => {
    const view = 1;
    const expectedAction = {
      type: 'DISCOVER_VIEW',
      view,
    };

    expect(actions.switchDiscoverView(view)).toEqual(expectedAction);
  });

  it('should setup the discover sections', () => {
    const sections = [
      {
        icon: {
          name: 'name',
          class: 'class',
        },
        id: '1',
        image: 'image.png',
        name: 'name_1',
      },
      {
        icon: {
          name: 'name',
          class: 'class',
        },
        id: '2',
        image: 'image.png',
        name: 'name_2',
      },
    ];

    const expectedAction = {
      type: 'SET_DISCOVER_SECTIONS',
      sections,
    };

    expect(actions.setDiscoverSections(sections)).toEqual(expectedAction);
  });

  it('should setup the discover links', () => {
    const links = [
      {
        icon: {
          name: 'name',
          class: 'class',
        },
        id: '1',
        image: 'image.png',
        name: 'name_1',
        links: [
          {
            name: 'link_1',
            link: 'http://example.com',
          },
        ],
      },
      {
        icon: {
          name: 'name',
          class: 'class',
        },
        id: '2',
        image: 'image.png',
        name: 'name_2',
        social: [
          {
            name: 'Twitter',
            link: 'http://example.com/twitter',
          },
        ],
      },
    ];

    const expectedAction = {
      type: 'SET_DISCOVER_LINKS',
      links,
    };

    expect(actions.setDiscoverLinks(links)).toEqual(expectedAction);
  });
});
