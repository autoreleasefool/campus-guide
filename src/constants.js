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
 * @created 2016-10-07
 * @file constants.js
 * @providesModule Constants
 * @description Constant values for the application
 *
 * @flow
 */
'use strict';

/**
 * Theme colors.
 */
const colors = {
  garnet: '#8F001A', // rgb(143, 0, 26)
  transparentGarnet: 'rgba(143, 0, 26, 0.8)',
  darkGrey: '#80746C', // rgb(128, 116, 108)
  transparentDarkGrey: 'rgba(128, 116, 108, 0.8)',
  polarGrey: '#F2F2F2', // rgb(242, 242, 242)
  transparentPolarGrey: 'rgba(242, 242, 242, 0.8)',
  lightGrey: '#ACA39A', // rgb(172, 164, 154)
  transparentLighGrey: 'rgba(172, 163, 154, 0.8)',
  charcoalGrey: '#2D2D2C', // rgb(45, 45, 44)
  transparentCharcoalGrey: 'rgba(45, 45, 45, 0.8)',

  white: 'white',
  transpareWhite: 'rgba(255, 255, 255, 0.7)',
  black: 'black',
  transparentBlack: 'rgba(0, 0, 0, 0.7)',

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
};

/**
 * Base icon sizes.
 */
const iconSizes = {
  Small: 18,
  Medium: 24,
  Large: 30,
  Tab: 26,
};

/**
 * Base margin sizes.
 */
const marginSizes = {
  Regular: 8,
  Condensed: 4,
  Expanded: 16,
};

/**
 * Base text sizes.
 */
const textSizes = {
  Caption: 12,
  Body: 14,
  Subtitle: 16,
  Title: 20,
};

/**
 * Defines the order of tabs in the app.
 */
const tabs = [
  'find',
  // 'schedule',
  'discover',
  'search',
  'settings',
];

/**
 * List of available building facilities
 */
const facilities = [
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
];

/**
 * List of common social media platforms
 */
const socialMediaPlatforms = [
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'youtube',
  'tumblr',
];

/**
 * Set of views to navigate through within FIND tab
 */
const Find = {
  Home: 0,          // Home find view where user can select a building
  Building: 1,      // Building details, where user can see details of a single building
  StartingPoint: 2, // User can select their starting point for directions
};

/**
 * Set of views to navigate through within DISCOVER tab
 */
const Discover = {
  Home: 0,  // Home discover view where user can see elements of university they can explore
  Links: 1, // Displays a list of useful links to the user
  Bus: 2,   // Displays information about the buses in the city
};

module.exports = {

  /**
   * Basic color definitions for components.
   */
  Colors: {
    ...colors,                                            // Import basic color definitions
    primaryBackground: colors.garnet,                     // Primary background color for the application
    secondaryBackground: colors.charcoalGrey,             // Secondary background color for the application
    primaryWhiteText: colors.white,                       // Primary color when white text is needed
    secondaryWhiteText: colors.transpareWhite,            // Secondary color when white text is needed
    primaryBlackText: colors.black,                       // Primary color when black text is needed
    secondaryBlackText: colors.transparentBlack,          // Secondary color when black text is needed
    primaryWhiteIcon: colors.white,                       // Primary color when white text is needed
    secondaryWhiteIcon: colors.transpareWhite,            // Secondary color when white text is needed
    primaryBlackIcon: colors.black,                       // Primary color when black text is needed
    secondaryBlackIcon: colors.transparentBlack,          // Secondary color when black text is needed
    darkTransparentBackground: 'rgba(0,0,0,0.4)',         // Dark transparent background color for components
    lightTransparentBackground: 'rgba(255,255,255,0.8)',  // Light transparent background color for components
  },

  /**
   * Common element sizes to use throughout the application.
   */
  Sizes: {
    Icons: iconSizes,
    Margins: marginSizes,
    Text: textSizes,
  },

  /**
   * Tabs within the app
   */
  Tabs: tabs,

  /**
   * Building facilities
   */
  Facilities: facilities,

  /**
   * Social media platforms
   */
  SocialMediaPlatforms: socialMediaPlatforms,

  /**
   * Views for navigation
   */
  Views: {
    Find,
    Discover,
  },
};
