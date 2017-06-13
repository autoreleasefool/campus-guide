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
 * @file schedule.ts
 * @description Provides schedule actions.
 */
'use strict';

// Types
import { ADD_COURSE, ADD_SEMESTER, LOAD_SCHEDULE, REMOVE_COURSE } from 'actionTypes';

module.exports = {

  addCourse: (semester: string, course: Course): Action => ({
    course,
    semester,
    type: ADD_COURSE,
  }),

  addSemester: (semester: Semester): Action => ({
    semester,
    type: ADD_SEMESTER,
  }),

  loadSchedule: (schedule: object): Action => ({
    schedule,
    type: LOAD_SCHEDULE,
  }),

  removeCourse: (semester: string, courseCode: string): Action => ({
    courseCode,
    semester,
    type: REMOVE_COURSE,
  }),

};
