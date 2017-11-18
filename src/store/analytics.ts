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
 * @created 2017-11-17
 * @file analytics.ts
 * @description Redux middleware to analyse user actions
 */
'use strict';

import * as Actions from '../actionTypes';
import * as Analytics from '../util/Analytics';
import * as Constants from '../constants';

// Types
import { Middleware } from 'redux';
import { Store } from './configureStore';
import { ActionType } from '../actionTypes';
import { Tab } from '../../typings/global';

let lastTabStart = (new Date()).getTime();

/**
 * Get the number of seconds spent in a tab.
 *
 * @returns {number} time since this function was last called
 */
function getLastTabDuration(): number {
  const currentTime = (new Date()).getTime();
  const duration = currentTime - lastTabStart;
  lastTabStart = currentTime;

  return duration / Constants.Time.MILLISECONDS_IN_SECOND;
}

/**
 * Get relevant info for a tab.
 *
 * @param {Tab}   tab   tab to get info on
 * @param {Store} store info store
 * @returns {any} object with tab data
 */
function getTabInfo(tab: Tab, store: Store): any {
  switch (tab) {
    case 'find':
      return {
        view: store.navigation.findView,
      };
    case 'schedule':
      return {};
    case 'discover':
      if (store.navigation.discoverView === Constants.Views.Discover.Housing) {
        return {
          housingView: store.navigation.housingView,
          view: Constants.Views.Discover.Housing,
        };
      } else if (store.navigation.discoverView === Constants.Views.Discover.Links) {
        return {
          linkId: store.navigation.linkId,
          view: Constants.Views.Discover.Links,
        };
      }

      return {
        view: store.navigation.discoverView,
      };
    case 'search':
      return {};
    case 'settings':
      return {};
    default:
      // Do nothing
  }
}

export const analytics: Middleware = ({ getState }: any): any => (next: any): any => (action: ActionType): any => {
  const prevState: Store = getState();
  const result = next(action);
  const curState: Store = getState();

  switch (action.type) {
    case Actions.Navigation.SwitchTab:
      Analytics.switchTab(curState.navigation.tab, prevState.navigation.tab, getLastTabDuration());
      break;
    case Actions.Directions.SetStartingPoint:
      Analytics.startNavigation(curState.directions.startingPoint, curState.directions.destination);
      break;
    case Actions.Schedule.AddCourse:
      Analytics.addCourse(action.course.code);
      break;
      case Actions.Schedule.RemoveCourse:
      Analytics.addCourse(action.courseCode);
      break;
    case Actions.Search.Search:
      if (action.terms && action.terms.length > 0) {
        Analytics.performSearch(action.terms, { tab: action.tab, ...getTabInfo(action.tab, curState) });
      }
      break;
    default:
      // does nothing
  }

  return result;
};
