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
 * @file Analytics-test.ts
 * @description Tests the functionality of the Analytics utility class
 *
 */

// Mock the react-native-fabric module
jest.mock('react-native-fabric');

// Types
import { Building, Course } from '../../../typings/university';

// Imports
import * as Analytics from '../Analytics';
import { default as Fabric } from 'react-native-fabric';

const building: Building = {
  facilities: [ 'atm', 'gym' ],
  image: 'image.png',
  location: {
    latitude: 100,
    longitude: 200,
  },
  rooms: [{ name: 'room_1', type: 'office' }, { name: 'name_2', type: 'class' }],
  shorthand: 'code',
  thumbnail: 'image.png',
};

const startingPoint = {
  room: '123',
  shorthand: building.shorthand,
};

const target = {
  room: '456',
  shorthand: building.shorthand,
};

const course: Course = {
  code: 'COURSE_CODE',
  lectures: [],
};

describe('Analytics-test', () => {

  beforeEach(() => {
    Analytics.setAnalyticsEnabledOverride(true, true);
    (Fabric as any).__clearCache();
  });

  it('tests if analytics get disabled', () => {
    Analytics.setAnalyticsEnabledOverride(false);
    Analytics.setPreference('language', 'en');
    Analytics.buildingSelected(building.shorthand);
    Analytics.roomSelected(building.shorthand, '123');
    Analytics.startNavigation(startingPoint, target);
    Analytics.failedNavigation(startingPoint, target, true);
    Analytics.addCourse(course.code);
    Analytics.removeCourse(course.code);
    Analytics.menuItemSelected('menu', 'item', 'id');
    Analytics.performSearch('query');
    Analytics.selectedSearchResult('item', 'id', 'query');
    Analytics.editSetting('setting', 0);
    Analytics.switchTab('find', 'discover', 1);
    Analytics.finishedIntroTour(true);

    expect((Fabric as any).__getDatastore()).toEqual({});
    expect((Fabric as any).__getEvents()).toEqual({});
  });

  it('tests if analytics are enabled', () => {
    expect(Analytics.isAnalyticsEnabled()).toBeTruthy();
    Analytics.setAnalyticsEnabledOverride(false);
    expect(Analytics.isAnalyticsEnabled()).toBeFalsy();
    Analytics.setAnalyticsEnabledOverride(true, false);
    expect(Analytics.isAnalyticsEnabled()).toBeFalsy();
  });

  it('tests setting the profile language', () => {
    Analytics.setPreference('language', 'en');
    expect((Fabric as any).__getDatastore()).toEqual({ preference_language: 'en' });
  });

  it('tests selecting a building', () => {
    Analytics.buildingSelected(building.shorthand);
    Analytics.buildingSelected(building.shorthand, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Selected building': [
        { shorthand: building.shorthand },
        { shorthand: building.shorthand, test: 0 },
      ],
    });
  });

  it('tests selecting a room', () => {
    Analytics.roomSelected(building.shorthand, '123');
    Analytics.roomSelected(building.shorthand, '456', { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Selected room': [
        { shorthand: building.shorthand, room: '123' },
        { shorthand: building.shorthand, room: '456', test: 0 },
      ],
    });
  });

  it('tests starting navigation', () => {
    Analytics.startNavigation(startingPoint, target);
    Analytics.startNavigation(startingPoint, target, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Started navigating': [
        { startingPoint, target },
        { startingPoint, target, test: 0 },
      ],
    });
  });

  it('tests failed navigation', () => {
    Analytics.failedNavigation(startingPoint, target, true);
    Analytics.failedNavigation(startingPoint, target, false, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Failed to find path': [
        { startingPoint, target, accessible: true },
        { startingPoint, target, accessible: false, test: 0 },
      ],
    });
  });

  it('tests adding a course', () => {
    Analytics.addCourse(course.code);
    Analytics.addCourse(course.code, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Added course to schedule': [
        { courseCode: course.code },
        { courseCode: course.code, test: 0 },
      ],
    });
  });

  it('tests removing a course', () => {
    Analytics.removeCourse(course.code);
    Analytics.removeCourse(course.code, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Removed course from schedule': [
        { courseCode: course.code },
        { courseCode: course.code, test: 0 },
      ],
    });
  });

  it('tests selecting an item from a menu', () => {
    Analytics.menuItemSelected('menu', 'item', 'id');
    Analytics.menuItemSelected('menu', 'item', 'id', { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'menu.item.id': [
        undefined,
        { test: 0 },
      ],
    });
  });

  it('tests performing a search', () => {
    Analytics.performSearch('query');
    Analytics.performSearch('query', { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      query: [
        undefined,
        { test: 0 },
      ],
    });
  });

  it('tests selecting a search result', () => {
    Analytics.selectedSearchResult('item', 'id', 'query');
    Analytics.selectedSearchResult('item', 'id', 'query', { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Search.item.id': [
        { query: 'query' },
        { query: 'query', test: 0 },
      ],
    });
  });

  it('tests changing a setting', () => {
    Analytics.editSetting('setting', 0);
    Analytics.editSetting('setting', 'value', { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Edited setting': [
        { settingName: 'setting', newValue: 0 },
        { settingName: 'setting', newValue: 'value', test: 0 },
      ],
    });
  });

  it('tests switching tabs', () => {
    Analytics.switchTab('find', 'discover', 1);
    Analytics.switchTab('search', 'settings', 2, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Switched tab': [
        { oldTab: 'discover', newTab: 'find', timeSpent: 1 },
        { oldTab: 'settings', newTab: 'search', timeSpent: 2, test: 0 },
      ],
    });
  });

  it('tests finishing the intro tour', () => {
    Analytics.finishedIntroTour(true);
    Analytics.finishedIntroTour(false, { test: 0 });

    expect((Fabric as any).__getEvents()).toEqual({
      'Finished intro tour': [
        { skipped: true },
        { skipped: false, test: 0 },
      ],
    });
  });

});