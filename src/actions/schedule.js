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
import type {
  Action,
  Course,
  Lecture,
  Semester,
} from 'types';

module.exports = {
  addSemester: (semester: Semester): Action => ({
    type: 'SCHEDULE_ADD_SEMESTER',
    semester,
  }),
  addCourse: (semester: string, course: Course): Action => ({
    type: 'SCHEDULE_ADD_COURSE',
    semester,
    course,
  }),
  removeCourse: (semester: string, courseCode: string): Action => ({
    type: 'SCHEDULE_REMOVE_COURSE',
    semester,
    courseCode,
  }),
  removeLecture: (semester: string, courseCode: string, day: number, startTime: number): Action => ({
    type: 'SCHEDULE_REMOVE_LECTURE',
    semester,
    courseCode,
    day,
    startTime,
  }),
};
