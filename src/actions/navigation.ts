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
import * as Actions from '../actionTypes';
import { MenuSection, Tab } from '../../typings/global';
import { Residence } from '../../typings/university';

export function canNavigateBack(key: string, can: boolean): any {
  return {
    can,
    key,
    type: Actions.Navigation.CanBack,
  };
}

export function navigateBack(): any {
  return {
    type: Actions.Navigation.NavigateBack,
  };
}

export function switchDiscoverView(view: number): any {
  return {
    type: Actions.App.SwitchDiscoverView,
    view,
  };
}

export function switchFindView(view: number): any {
  return {
    type: Actions.App.SwitchFindView,
    view,
  };
}

export function switchHousingView(view: number): any {
  return {
    type: Actions.App.SwitchHousingView,
    view,
  };
}

export function switchLinkCategory(linkId: string | number | undefined): any {
  return {
    linkId,
    type: Actions.App.SwitchDiscoverLink,
  };
}

export function switchResidence(residence: Residence | undefined): any {
  return {
    residence,
    type: Actions.App.SwitchHousingResidence,
  };
}

export function switchTab(tab: Tab): any {
  return {
    tab,
    type: Actions.App.SwitchTab,
  };
}

export function switchTransitCampus(campus: MenuSection | undefined): any {
  return {
    campus,
    type: Actions.App.SwitchDiscoverTransitCampus,
  };
}
