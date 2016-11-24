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
 * @description Tests discover reducers
 *
 */
'use strict';

// Imports
import reducer from '../discover';

// Expected initial state
const initialState = {
  campus: null,
  links: [],
  sections: [],
  view: 0,
};

describe('discover reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should switch to a new view', () => {
    expect(
      reducer(
        initialState,
        {
          type: 'DISCOVER_VIEW',
          view: 1,
        }
      )
    ).toEqual(
      {
        ...initialState,
        view: 1,
      }
    );
  });

  it('should set the discover sections', () => {
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

    expect(
      reducer(
        initialState,
        {
          type: 'SET_DISCOVER_SECTIONS',
          sections,
        }
      )
    ).toEqual(
      {
        ...initialState,
        sections,
      }
    );
  });

  it('should set the discover links', () => {
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

    expect(
      reducer(
        initialState,
        {
          type: 'SET_DISCOVER_LINKS',
          links,
        }
      )
    ).toEqual(
      {
        ...initialState,
        links,
      }
    );
  });

  it('should set the transit campus to display', () => {
    const campus = {
      background: 'background',
      image: 'image',
      name: 'name',
    };

    expect(
      reducer(
        initialState,
        {
          type: 'SHOW_TRANSIT_CAMPUS',
          campus,
        }
      )
    ).toEqual(
      {
        ...initialState,
        campus,
      }
    );
  });
});
