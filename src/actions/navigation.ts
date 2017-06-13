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
 * @created 2016-10-08
 * @file navigation.ts
 * @description Provides navigation actions.
 */
'use strict';

// Types
import {
  NAVIGATE_BACK,
  SET_CAN_BACK,
  SWITCH_DISCOVER_LINK,
  SWITCH_DISCOVER_TRANSIT_CAMPUS,
  SWITCH_DISCOVER_VIEW,
  SWITCH_FIND_VIEW,
  SWITCH_HOUSING_RESIDENCE,
  SWITCH_HOUSING_VIEW,
  SWITCH_TAB,
} from 'actionTypes';

module.exports = {

  canNavigateBack: (key: string, can: boolean): Action => ({
    can,
    key,
    type: SET_CAN_BACK,
  }),

  navigateBack: (): Action => ({
    type: NAVIGATE_BACK,
  }),

  switchDiscoverView: (view: number): Action => ({
    type: SWITCH_DISCOVER_VIEW,
    view,
  }),

  switchFindView: (view: number): Action => ({
    type: SWITCH_FIND_VIEW,
    view,
  }),

  switchHousingView: (view: number): Action => ({
    type: SWITCH_HOUSING_VIEW,
    view,
  }),

  switchLinkCategory: (linkId: string | number | undefined): Action => ({
    linkId,
    type: SWITCH_DISCOVER_LINK,
  }),

  switchResidence: (residence: Residence | undefined): Action => ({
    residence,
    type: SWITCH_HOUSING_RESIDENCE,
  }),

  switchTab: (tab: Tab): Action => ({
    tab,
    type: SWITCH_TAB,
  }),

  switchTransitCampus: (campus: MenuSection | undefined): Action => ({
    campus,
    type: SWITCH_DISCOVER_TRANSIT_CAMPUS,
  }),

};
