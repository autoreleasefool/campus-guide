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
 * @file Constants.js
 * @providesModule Constants
 * @description Constant values for the application.
 *
 * @flow
 */
'use strict';

module.exports = {

  /**
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

    /**
     * School faculty colours
     */

    arts: '#FFFFFF',
    law: '#A9343A',
    engineering: '#DF4526',
    education: '#628FB6',
    graduate: '#35343B',
    healthSciences: '#B9BF15',
    telfer: '#8C2633',
    medicine: '#2F1A45',
    sciences: '#FFDA00',
    socialSciences: '#009D93',
  },

  /**
   * Identifiers for the views throughout the application.
   * NOTE: When adding a new view here, make sure you also update js/util/ScreenUtils.js
   */
  Views: {

    /**
     * TODO: Change default to 100
     */
    Default: 100,
    DefaultTab: 100,
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
      BusCampusList: 301,
      BusCampusDetails: 302,
      LinksHome: 303,
      LinkCategory: 304,
      ShuttleCampusList: 305,
      ShuttleCampusDetails: 306,
      ShuttleInfo: 307,
      HotSpots: 308,
    },
    Settings: {
      Home: 400,
    },
  },

  /**
   * Common text sizes to use throughout the application.
   */
  Text: {
    Small: 14,
    Medium: 16,
    Large: 20,
    Title: 24,
  },

  /**
   * Defines the order of tabs in the app.
   * Tabs added here should also be accounted for in Types.TabItems, Tabs.ios.js, and Tabs.android.js
   */
  Tabs: [
    'find',
    // 'schedule',
    'discover',
    'settings',
  ],

  /**
   * List of available building facilities
   */
  Facilities: [
    'atm',
    'food',
    'printer',
    'store',
    'bed',
    'alcohol',
    'laundry',
    'library',
    'parking',
    'mail',
    'pharmacy',
    'gym',
    'pool',
    'invalid',
  ],

  /**
   * List of common social media platforms
   */
  SocialMediaPlatforms: [
    'linkedin',
    'twitter',
    'facebook',
    'instagram',
    'youtube',
    'tumblr',
  ],
};
