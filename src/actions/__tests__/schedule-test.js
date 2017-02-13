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
 * @created 2016-10-30
 * @file schedule-test.js
 * @description Tests schedule actions
 *
 */
'use strict';

// Types
import { ADD_SEMESTER, ADD_COURSE, REMOVE_COURSE } from 'actionTypes';

// Imports
import * as actions from '../schedule';

describe('schedule actions', () => {

  it('creates an action to add a new semester', () => {
    const semester = { id: 'semester1', courses: [], name: 'semester 1' };
    const expectedAction = { type: ADD_SEMESTER, semester };
    expect(actions.addSemester(semester)).toEqual(expectedAction);
  });

  it('creates an action to add a new course', () => {
    const semester = 'semester1';
    const course = { code: 'COURSE_CODE', lectures: []};
    const expectedAction = { type: ADD_COURSE, semester, course };
    expect(actions.addCourse(semester, course)).toEqual(expectedAction);
  });

  it('creates an action to remove a course', () => {
    const semester = 'semester1';
    const courseCode = 'COURSE_CODE';
    const expectedAction = { type: REMOVE_COURSE, semester, courseCode };
    expect(actions.removeCourse(semester, courseCode)).toEqual(expectedAction);
  });

});
