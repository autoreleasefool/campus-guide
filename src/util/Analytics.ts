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
 * @created 2017-11-16
 * @file Analytics.ts
 * @description Wrap Crashlytics and Answers analytics functionality.
 */

// Imports
import { Answers, Crashlytics } from 'react-native-fabric';

// Types
import { Destination } from '../../typings/university';
import { Tab } from 'typings/global';

/** Optional values to send with events. */
interface EventOptions {
  [key: string]: string | number | boolean | undefined;
}

// Force analytics on or off, if analyticsOverrideEnabled is tru
let analyticsOverride = false;
// Enable override analytics setting.
let analyticsOverrideEnabled = false;

/**
 * Check if analytics are enabled.
 *
 * @returns {boolean} true if analytics are enabled, false otherwise.
 */
export function isAnalyticsEnabled(): boolean {
  return (analyticsOverrideEnabled && analyticsOverride) || !__DEV__;
}

/**
 * Override to enable or disable analytics. Only works in dev.
 *
 * @param {boolean} enableOverride true to enable override, false to return to default setting.
 * @param {boolean} enabled        true to enable analytics, false to return to default.
 */
export function setAnalyticsEnabledOverride(enableOverride: boolean, enabled?: boolean): void {
  analyticsOverrideEnabled = enableOverride;
  analyticsOverride = enabled || false;
}

/**
 * Update user preferences.
 *
 * @param {string} preferenceName  the preference being updated
 * @param {string} preferenceValue the value of the preference
 */
export function setPreference(preferenceName: string, preferenceValue: string): void {
  if (isAnalyticsEnabled()) {
    Crashlytics.setString(`preference_${preferenceName}`, preferenceValue);
  } else {
    console.log(`Analytics, preference set: ${preferenceName}: ${preferenceValue}`);
  }
}

/**
 * Indicate user selected a building.
 *
 * @param {string}       shorthand the building id
 * @param {EventOptions} options   optional event params
 */
export function buildingSelected(shorthand: string, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Selected building', {
      ...options,
      shorthand,
    });
  } else {
    console.log(`Analytics, selected building: ${shorthand}\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate user selected a room in a building.
 *
 * @param {string}           shorthand the building id
 * @param {string|undefined} room      name of the room selected
 * @param {EventOptions}     options   optional event params
 */
export function roomSelected(shorthand: string, room: string | undefined, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Selected room', {
      ...options,
      room,
      shorthand,
    });
  } else {
    console.log(`Analytics, selected room: ${shorthand} ${room}\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate user began navigation to a destination.
 *
 * @param {Destination}  startingPoint building/room on campus which navigation started from
 * @param {Destination}  target        building/room on campus to which the user is going
 * @param {EventOptions} options       optional event params
 */
export function startNavigation(startingPoint: Destination, target: Destination, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Started navigating', {
      ...options,
      startingPoint,
      target,
    });
  } else {
    console.log(`Analytics, started navigating: ${JSON.stringify(startingPoint)} to ${JSON.stringify(target)}`
        + `\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate a user's request for navigation was unfulfilled between two destinations - possibly in error.
 *
 * @param {Destination}  startingPoint building/room on campus which navigation started from
 * @param {Destination}  target        building/room on campus to which the user is going
 * @param {boolean}      accessible    true if the navigation was meant to be accessible, false otherwise
 * @param {EventOptions} options       optional event params
 */
export function failedNavigation(
    startingPoint: Destination,
    target: Destination,
    accessible: boolean,
    options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Failed to find path', {
      ...options,
      accessible,
      startingPoint,
      target,
    });
  } else {
    console.log(`Analytics, failed navigation: ${JSON.stringify(startingPoint)} to ${JSON.stringify(target)}`
        + `\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate user has added a course to their schedule.
 *
 * @param {string}       courseCode details of the added course
 * @param {EventOptions} options    optional event params
 */
export function addCourse(courseCode: string, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Added course to schedule', {
      ...options,
      courseCode,
    });
  } else {
    console.log(`Analytics, added course: ${courseCode}\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate user has removed a course from their schedule.
 *
 * @param {string}       courseCode details of the removed course
 * @param {EventOptions} options    optional event params
 */
export function removeCourse(courseCode: string, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Removed course from schedule', {
      ...options,
      courseCode,
    });
  } else {
    console.log(`Analytics, removed course: ${courseCode}\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate that a user selected a menu item.
 *
 * @param {string}       menuName name of the menu
 * @param {string}       itemName item selected in the menu
 * @param {string}       itemId   id of the item
 * @param {EventOptions} options  optional event params
 */
export function menuItemSelected(menuName: string, itemName: string, itemId: string, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logContentView(itemName, menuName, itemId, options);
  } else {
    console.log(`Analytics, viewed menu item: ${menuName}.${itemName}.${itemId}`
        + `\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate that a user performed a search.
 *
 * @param {string}       text    query text
 * @param {EventOptions} options optional event params
 */
export function performSearch(text: string, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logSearch(text, options);
  } else {
    console.log(`Analytics, performed search: ${text}\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate that a user selected an item from search results.
 *
 * @param {string}       itemName item selected
 * @param {string}       itemId   id of the item
 * @param {string}       query    query performed
 * @param {EventOptions} options  optional event params
 */
export function selectedSearchResult(itemName: string, itemId: string, query: string, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logContentView(itemName, 'Search', itemId, {
      ...options,
      query,
    });
  } else {
    console.log(`Analytics, selected search result: ${query}.${itemName}.${itemId}`
        + `\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Indicate that a user changed a setting.
 *
 * @param {string}       settingName name of the setting changed
 * @param {any}          newValue    new setting value
 * @param {EventOptions} options     optional event params
 */
export function editSetting(settingName: string, newValue: any, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Edited setting', {
      ...options,
      newValue,
      settingName,
    });
  } else {
    console.log(`Analytics, edited setting: ${settingName} - ${newValue}\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Record time user spent in a tab, and the tab the switched to.
 *
 * @param {Tab}          newTab    tab switched to
 * @param {Tab}          oldTab    tab switch from
 * @param {number}       timeSpent time spent in old tab
 * @param {EventOptions} options   optional event params
 */
export function switchTab(newTab: Tab, oldTab: Tab, timeSpent: number, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Switched tab', {
      ...options,
      newTab,
      oldTab,
      timeSpent,
    });
  } else {
    console.log(`Analytics, switched tab: ${oldTab} to ${newTab}, spent ${timeSpent}`
        + `\nOptions: ${JSON.stringify(options)}`);
  }
}

/**
 * Record user's interactionn with the intro tour.
 *
 * @param {boolean}      skipped true if the user skipped the tour, false if they completed it
 * @param {EventOptions} options optional event params
 */
export function finishedIntroTour(skipped: boolean, options?: EventOptions): void {
  if (isAnalyticsEnabled()) {
    Answers.logCustom('Finished intro tour', {
      ...options,
      skipped,
    });
  } else {
    console.log(`Analytics, finished intro tour. Skipped? ${skipped}`
        + `\nOptions: ${JSON.stringify(options)}`);
  }
}