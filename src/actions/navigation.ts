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
 * @created 2016-10-08
 * @file navigation.ts
 * @description Provides navigation actions.
 */
'use strict';

// Types
import * as Actions from '../actionTypes';
import { SingleMenuSection, Name, Tab } from '../../typings/global';
import { Residence } from '../../typings/university';

export function canNavigateBack(key: string, can: boolean): Actions.ActionType {
  return {
    can,
    key,
    type: Actions.Navigation.CanBack,
  };
}

export function navigateBack(): Actions.ActionType {
  return {
    type: Actions.Navigation.NavigateBack,
  };
}

export function setHeaderTitle(
    title: Name | string | undefined,
    tab: Tab,
    view: number,
    setActive?: boolean): Actions.ActionType {
  return {
    setActive: setActive || false,
    tab,
    title,
    type: Actions.Navigation.SetTitle,
    view,
  };
}

export function showBack(show: boolean, tab?: Tab, disableAnimation?: boolean): Actions.ActionType {
  return {
    disableAnimation,
    show,
    tab,
    type: Actions.Navigation.ShowBack,
  };
}

export function showSearch(show: boolean, tab?: Tab, disableAnimation?: boolean): Actions.ActionType {
  return {
    disableAnimation,
    show,
    tab,
    type: Actions.Navigation.ShowSearch,
  };
}

export function switchDiscoverView(view: number): Actions.ActionType {
  return {
    type: Actions.Navigation.SwitchDiscoverView,
    view,
  };
}

export function switchFindView(view: number): Actions.ActionType {
  return {
    type: Actions.Navigation.SwitchFindView,
    view,
  };
}

export function switchHousingView(view: number): Actions.ActionType {
  return {
    type: Actions.Navigation.SwitchHousingView,
    view,
  };
}

export function switchLinkCategory(linkId: string | number | undefined): Actions.ActionType {
  return {
    linkId,
    type: Actions.Navigation.SwitchDiscoverLink,
  };
}

export function switchResidence(residence: Residence | undefined): Actions.ActionType {
  return {
    residence,
    type: Actions.Navigation.SwitchHousingResidence,
  };
}

export function switchTab(tab: Tab): Actions.ActionType {
  return {
    tab,
    type: Actions.Navigation.SwitchTab,
  };
}

export function switchTransitCampus(campus: SingleMenuSection | undefined): Actions.ActionType {
  return {
    campus,
    type: Actions.Navigation.SwitchDiscoverTransitCampus,
  };
}

export function showIntroTour(show: boolean = true, skipped: boolean = false): Actions.ActionType {
  return {
    show,
    skipped,
    type: Actions.Navigation.ShowIntroTour,
  };
}
