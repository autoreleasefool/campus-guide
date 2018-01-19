/**
 *
 * @license
 * Copyright (C) 2017 Joseph Roque
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
 * @file directions.ts
 * @description Provides direction actions.
 */
'use strict';

// Types
import * as Actions from '../actionTypes';
import { Building, Destination } from '../../typings/university';

export function setDestination(destination: Destination): Actions.ActionType {
  return {
    destination,
    type: Actions.Directions.SetDestination,
  };
}

export function setStartingPoint(startingPoint: Destination): Actions.ActionType {
  return {
    startingPoint,
    type: Actions.Directions.SetStartingPoint,
  };
}

export function viewBuilding(building: Building): Actions.ActionType {
  return {
    building,
    type: Actions.Directions.ViewBuilding,
  };
}
