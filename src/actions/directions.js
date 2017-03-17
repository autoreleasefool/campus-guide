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
 * @created 2017-02-11
 * @file directions.js
 * @description Provides direction actions.
 *
 * @flow
 */
'use strict';

// Types
import type { Building, Destination } from 'types';
import { SET_DESTINATION, SET_STARTING_POINT, VIEW_BUILDING } from 'actionTypes';

module.exports = {

  setDestination: (destination: Destination) => ({
    type: SET_DESTINATION,
    destination,
  }),

  setStartingPoint: (startingPoint: Destination) => ({
    type: SET_STARTING_POINT,
    startingPoint,
  }),

  viewBuilding: (building: Building) => ({
    type: VIEW_BUILDING,
    building,
  }),

};
