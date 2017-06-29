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
 * @created 2017-02-12
 * @file directions.js
 * @description Reducers for direction actions
 */
'use strict';

// Imports
import * as Actions from '../actionTypes';
import { Building, Destination } from '../../typings/university';

/** Directions reducer state. */
export interface State {
  building: Building | undefined;         // The building selected by the user to navigate to, or view
  destination: Destination | undefined;   // The building and room the user is navigating to
  startingPoint: Destination | undefined; // The building and room the user is starting from
}

/** Initial directions state. */
const initialState: State = {
  building: undefined,
  destination: undefined,
  startingPoint: undefined,
};

/**
 * When provided with a direction action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function directions(state: State = initialState, action: any): State {
  switch (action.type) {
    case Actions.Directions.SetDestination:
      return {
        ...state,
        destination: action.destination,
      };
    case Actions.Directions.SetStartingPoint:
      return {
        ...state,
        startingPoint: action.startingPoint,
      };
    case Actions.Directions.ViewBuilding:
      return {
        ...state,
        building: action.building,
      };
    default:
      return state;
  }
}
