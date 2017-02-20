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
 * @created 2016-10-27
 * @file schedule.js
 * @description Provides schedule actions.
 *
 * @flow
 */
'use strict';

// Types
import type { Course, Semester } from 'types';
import { ADD_SEMESTER, ADD_COURSE, LOAD_SCHEDULE, REMOVE_COURSE } from 'actionTypes';

module.exports = {

  loadSchedule: (schedule: Object) => ({
    type: LOAD_SCHEDULE,
    schedule,
  }),

  addSemester: (semester: Semester) => ({
    type: ADD_SEMESTER,
    semester,
  }),

  addCourse: (semester: string, course: Course) => ({
    type: ADD_COURSE,
    semester,
    course,
  }),

  removeCourse: (semester: string, courseCode: string) => ({
    type: REMOVE_COURSE,
    semester,
    courseCode,
  }),

};
