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

const colors = {
  garnet: '#8F001A',
  darkGrey: '#80746C',
  polarGrey: '#F2F2F2',
  lightGrey: '#ACA39A',
  charcoalGrey: '#2D2D2C',
};

const textSizes = {
  Caption: 12,
  Body: 14,
  Subtitle: 16,
  Title: 20,
};

module.exports = {

  /**
   * Basic color definitions for components.
   */
  Colors: {
    ...colors,                        // Import basic color definitions
    primaryBackground: colors.garnet, // Primary background color for the application
  },

  /**
   * Common element sizes to use throughout the application.
   */
  Sizes: {
    Text: textSizes,
  },

};
