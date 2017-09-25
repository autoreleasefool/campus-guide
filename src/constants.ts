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
 * @created 2016-10-07
 * @file constants.ts
 * @description Constant values for the application
 */
'use strict';

// Types
import { Tab } from '../typings/global';
import { Facility } from '../typings/university';

/* tslint:disable object-literal-sort-keys */
/* Keys out of order to preserver importance, different groupings, etc. */

const CoreTranslations = require('../assets/json/CoreTranslations');

/**
 * Theme colors.
 */
const baseColors = {
  garnet: '#8F001A',
  transparentGarnet: 'rgba(143, 0, 26, 0.7)',
  veryTransparentGarnet: 'rgba(143, 0, 26, 0.4)',
  invisibleGarnet: 'rgba(143, 0, 26, 0)',

  darkGrey: '#80746C',
  transparentDarkGrey: 'rgba(128, 116, 108, 0.7)',
  veryTransparentDarkGrey: 'rgba(128, 116, 108, 0.4)',
  invisibleDarkGrey: 'rgba(128, 116, 108, 0)',

  polarGrey: '#F2F2F2',
  transparentPolarGrey: 'rgba(242, 242, 242, 0.7)',
  veryTransparentPolarGrey: 'rgba(242, 242, 242, 0.4)',
  invisiblePolarGrey: 'rgba(242, 242, 242, 0)',

  lightGrey: '#ACA39A',
  transparentLightGrey: 'rgba(172, 163, 154, 0.7)',
  veryTransparentLightGrey: 'rgba(172, 163, 154, 0.4)',
  invisibleLightGrey: 'rgba(172, 163, 154, 0)',

  charcoalGrey: '#2D2D2C',
  transparentCharcoalGrey: 'rgba(45, 45, 45, 0.7)',
  veryTransparentCharcoalGrey: 'rgba(45, 45, 45, 0.4)',
  invisibleCharcoalGrey: 'rgba(45, 45, 45, 0)',

  white: 'white',
  transparentWhite: 'rgba(255, 255, 255, 0.7)',
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
 * Basic color definitions for components.
 */
export const Colors = {
  ...baseColors,
  primaryBackground: baseColors.garnet,                   // Primary background color for the application
  secondaryBackground: baseColors.charcoalGrey,           // Secondary background color for the application
  tertiaryBackground: baseColors.polarGrey,               // Tertiary background color for the application

  primaryWhiteText: baseColors.polarGrey,                 // Primary color when white text is needed
  secondaryWhiteText: baseColors.transparentPolarGrey,    // Secondary color when white text is needed
  primaryBlackText: baseColors.black,                     // Primary color when black text is needed
  secondaryBlackText: baseColors.transparentBlack,        // Secondary color when black text is needed

  primaryWhiteIcon: baseColors.polarGrey,                 // Primary color when white icons are needed
  secondaryWhiteIcon: baseColors.transparentPolarGrey,    // Secondary color when white icons are needed
  tertiaryWhiteIcon: baseColors.veryTransparentPolarGrey, // Tertiary color when white icons are needed
  primaryBlackIcon: baseColors.black,                     // Primary color when black icons are needed
  secondaryBlackIcon: baseColors.transparentBlack,        // Secondary color when black icons are needed

  darkTransparentBackground: 'rgba(0,0,0,0.4)',           // Dark transparent background color for components
  darkMoreTransparentBackground: 'rgba(0,0,0,0.2)',       // Dark transparent background color for components
  lightTransparentBackground: 'rgba(255,255,255,0.8)',    // Light transparent background color for components
};

/**
 * Base icon sizes.
 */
const iconSizes = {
  Small: 18,
  Medium: 24,
  Large: 30,
  Jumbo: 48,
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
 * Common element sizes to use throughout the application.
 */
export const Sizes = {
  Icons: iconSizes,
  Margins: marginSizes,
  Text: textSizes,
  HeaderPadding: {
    android: 0,
    ios: 20,
  },
};

/**
 * Defines the order of tabs in the app.
 */
export const Tabs: Tab[] = [
  'find',
  'schedule',
  'discover',
  'search',
  'settings',
];

/**
 * List of available building facilities
 */
export const Facilities: Facility[] = [
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
export const SocialMediaPlatforms = [
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'youtube',
  'tumblr',
];

/**
 * Time constants
 */
export const Time = {
  MILLISECONDS_IN_SECOND: 1000,
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 12,
  DAYS_IN_WEEK: 7,
  HOURS_UNDER_PREFIXED: 10,
  MINUTES_UNDER_PREFIXED: 10,
  SECONDS_UNDER_PREFIXED: 10,
};

/**
 * Day translations, in order.
 */
export const Days = {
  en: [
    CoreTranslations.en.monday,
    CoreTranslations.en.tuesday,
    CoreTranslations.en.wednesday,
    CoreTranslations.en.thursday,
    CoreTranslations.en.friday,
    CoreTranslations.en.saturday,
    CoreTranslations.en.sunday,
  ],
  fr: [
    CoreTranslations.fr.monday,
    CoreTranslations.fr.tuesday,
    CoreTranslations.fr.wednesday,
    CoreTranslations.fr.thursday,
    CoreTranslations.fr.friday,
    CoreTranslations.fr.saturday,
    CoreTranslations.fr.sunday,
  ],
};

/**
 * Views for navigation
 */
export const Views = {

  /**
   * Set of views to navigate through within FIND tab
   */
  Find: {
    Home: 0,          // Home find view where user can select a building
    Building: 1,      // Building details, where user can see details of a single building
    StartingPoint: 2, // User can select their starting point for directions
    Steps: 3,         // Tells the user steps between starting point and destination
  },

  /**
   * Set of views to navigate through within DISCOVER tab
   */
  Discover: {
    Home: 0,        // Home discover view where user can see elements of university they can explore
    Links: 1,       // Displays a list of useful links to the user
    Transit: 2,     // Displays information about the transit system in the city
    Shuttle: 3,     // Displays information about the university's campus shuttle
    StudySpots: 4,  // Displays a list of study spots around campus and properties of them
    Housing: 5,     // Displays information about housing at the university
  },

  /**
   * Set of views to navigate through within Housing screen
   */
  Housing: {
    Menu: 0,              // Main housing view, to select other screens
    Residences: 1,        // List of residences
    ResidenceDetails: 2,  // Details about a single residence
    ResidenceSelect: 3,   // List of residences, with multiple selectable
    ResidenceCompare: 4,  // Comparison between residences
    Resources: 5,         // Resources for housing information
  },
};

/**
 * Default map view information
 */
export const Map = {
  DefaultDelta: 0.02,
  InitialRegion: {
    latitude: 45.4222,
    longitude: -75.6824,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  },
};

/**
 * Default type to assign to rooms when not defined
 */
export const DefaultRoomType = 'office';
