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
 * @description Tests schedule reducers
 *
 */
'use strict';

// Types
import { ADD_SEMESTER, ADD_COURSE, REMOVE_COURSE } from 'actionTypes';

// Imports
import reducer from '../schedule';

// Expected initial state
const initialState = {
  semesters: {},
};

// Basic semesters for testing
const testSemesters = [
  {
    id: 'semester1',
    courses: [],
    name: 'Semester 1',
  },
  {
    id: 'semester2',
    courses: [],
    name: 'Semester 1',
  },
  {
    id: 'semester1',
    courses: [],
    name_en: 'English',
    name_fr: 'French',
  },
];

// Basic lectures for testing
const testLectures = [
  {
    day: 1,
    endTime: 90,
    format: 0,
    startTime: 0,
  },
  {
    day: 2,
    endTime: 180,
    format: 3,
    startTime: 270,
  },
  {
    day: 1,
    endTime: 180,
    format: 1,
    startTime: 90,
  },
];

// Basic courses for testing
const testCourses = [
  {
    code: 'code1',
    lectures: [],
  },
  {
    code: 'code2',
    lectures: [
      testLectures[0],
      testLectures[1],
    ],
  },
  {
    code: 'code1',
    lectures: [
      {
        name: 'Empty Lecture',
      },
    ],
  },
];

describe('schedule reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should add a new semester to the schedule', () => {
    expect(reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] }))
        .toEqual({ ...initialState, semesters: { semester1: testSemesters[0] }});
  });

  it('should add a new course to the schedule', () => {
    const state = reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] });
    expect(reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[0] }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0] ],
            },
          },
        });
  });

  it('should overwrite the course in the schedule', () => {
    let state = reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[1] });
    expect(reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[2] }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[2], testCourses[1] ],
            },
          },
        });
  });

  it('should remove the course in the schedule', () => {
    let state = reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[1] });
    expect(reducer(state, { type: REMOVE_COURSE, semester: testSemesters[0].id, courseCode: testCourses[1].code }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0] ],
            },
          },
        });
  });

  it('should fail to remove a non-existant course', () => {
    let state = reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[1] });
    expect(reducer(state, { type: REMOVE_COURSE, semester: testSemesters[0].id, courseCode: 'invalid code' }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0], testCourses[1] ],
            },
          },
        });
  });

  it('should not find the semester to add a course', () => {
    const state = reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] });
    expect(reducer(state, { type: ADD_COURSE, semester: testSemesters[1].id, course: testCourses[0] }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [],
            },
          },
        });
  });

  it('should not find the semester to remove a course', () => {
    let state = reducer(initialState, { type: ADD_SEMESTER, semester: testSemesters[0] });
    state = reducer(state, { type: ADD_COURSE, semester: testSemesters[0].id, course: testCourses[0] });
    expect(reducer(state, { type: REMOVE_COURSE, semester: testSemesters[1].id, courseCode: testCourses[0].code }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0] ],
            },
          },
        });
  });

});
