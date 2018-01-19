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
 * @created 2016-10-30
 * @file schedule-test.ts
 * @description Tests schedule reducers
 *
 */
'use strict';

// Imports
import { default as reducer, State } from '../schedule';

// Types
import * as Actions from '../../actionTypes';
import { Course, Lecture, Semester } from '../../../typings/university';

// Expected initial state
const initialState: State = {
  semesters: {},
};

// Basic semesters for testing
const testSemesters: Semester[] = [
  {
    courses: [],
    id: 'semester1',
    name: 'Semester 1',
  },
  {
    courses: [],
    id: 'semester2',
    name: 'Semester 1',
  },
  {
    courses: [],
    id: 'semester1',
    name_en: 'English',
    name_fr: 'French',
  },
];

// Basic lectures for testing
const testLectures: Lecture[] = [
  {
    day: 1,
    endTime: 90,
    format: 0,
    location: { shorthand: 'building' },
    startTime: 0,
  },
  {
    day: 2,
    endTime: 180,
    format: 3,
    location: { shorthand: 'building' },
    startTime: 270,
  },
  {
    day: 1,
    endTime: 180,
    format: 1,
    location: { shorthand: 'building' },
    startTime: 90,
  },
];

// Basic courses for testing
const testCourses: Course[] = [
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
      testLectures[2],
    ],
  },
];

describe('schedule reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: Actions.Other.Invalid })).toEqual(initialState);
  });

  it('should replace the existing schedule', () => {
    const schedule = { semester1: testSemesters[2] };
    const state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    expect(reducer(state, { type: Actions.Schedule.Load, schedule }))
        .toEqual({ ...initialState, semesters: schedule });
  });

  it('should add a new semester to the schedule', () => {
    expect(reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] }))
        .toEqual({ ...initialState, semesters: { semester1: testSemesters[0] } });
  });

  it('should add a new course to the schedule', () => {
    const state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    expect(reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[0] }))
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
    let state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[1] });
    expect(reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[2] }))
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

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    let state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[1] });
    expect(reducer(state, { type: Actions.Schedule.RemoveCourse, semester: testSemesters[0].id, courseCode: testCourses[1].code }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0] ],
            },
          },
        });

    /* tslint:enable max-line-length */

  });

  it('should fail to remove a non-existant course', () => {

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    let state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[1] });
    expect(reducer(state, { type: Actions.Schedule.RemoveCourse, semester: testSemesters[0].id, courseCode: 'invalid code' }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0], testCourses[1] ],
            },
          },
        });

    /* tslint:enable max-line-length */

  });

  it('should not find the semester to add a course', () => {
    const state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    expect(reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[1].id, course: testCourses[0] }))
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

    /* Ignore max line length for clearer test cases */
    /* tslint:disable max-line-length */

    let state = reducer(initialState, { type: Actions.Schedule.AddSemester, semester: testSemesters[0] });
    state = reducer(state, { type: Actions.Schedule.AddCourse, semester: testSemesters[0].id, course: testCourses[0] });
    expect(reducer(state, { type: Actions.Schedule.RemoveCourse, semester: testSemesters[1].id, courseCode: testCourses[0].code }))
        .toEqual({
          ...state,
          semesters: {
            semester1: {
              ...state.semesters.semester1,
              courses: [ testCourses[0] ],
            },
          },
        });

    /* tslint:enable max-line-length */

  });

});
