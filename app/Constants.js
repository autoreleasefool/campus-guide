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
 * @file
 * Constants.js
 *
 * @description
 * Constant values for the application.
 *
 * @author
 * Joseph Roque
 *
 * @external
 * @flow
 *
 */
'use strict';

module.exports = {

  /*
   * Base color definitions for components.
   */
  Colors: {
    garnet: '#8F001A',
    darkGrey: '#80746C',
    polarGrey: '#F2F2F2',
    lightGrey: '#ACA39A',
    charcoalGrey: '#2D2D2C',
    transparent: 'rgba(0, 0, 0, 0)',
    rootElementBorder: 'rgba(0, 0, 0, 0.25)',
    defaultComponentBackgroundColor: 'rgba(0,0,0,0.4)',
    whiteComponentBackgroundColor: 'rgba(255,255,255,0.8)',
    primaryWhiteText: 'white',
    secondaryWhiteText: 'rgba(255, 255, 255, 0.7)',
    primaryBlackText: 'black',
    secondaryBlackText: 'rgba(0, 0, 0, 0.7)',
  },

  /*
   * Identifiers for the views throughout the application.
   * NOTE: When adding a new view here, make sure you also
   * update app/util/ScreenUtils.js
   */
  Views: {

    /*
     * TODO: Change default to 100
     */
    Default: 300,
    Splash: 1,
    Main: 2,
    Find: {
      Home: 100,
      Building: 101,
      Search: 102,
    },
    Schedule: {
      Home: 200,
      Editor: 201,
    },
    Discover: {
      Home: 300,
      BusCampuses: 301,
      BusCampusStops: 302,
      LinksHome: 303,
      LinkCategory: 304,
      ShuttleInfo: 305,
      ShuttleCampusInfo: 306,
      ShuttleDetails: 307,
    },
    Settings: {
      Home: 400,
    },
  },
};
