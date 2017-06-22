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
import * as Actions from '../actionTypes';
import { Course, Semester } from '../../typings/university';

export function addCourse(semester: string, course: Course): any {
  return {
    course,
    semester,
    type: Actions.Schedule.AddCourse,
  };
}

export function addSemester(semester: Semester): any {
  return {
    semester,
    type: Actions.Schedule.AddSemester,
  };
}

export function loadSchedule(schedule: object): any {
  return {
    schedule,
    type: Actions.Schedule.Load,
  };
}

export function removeCourse(semester: string, courseCode: string): any {
  return {
    courseCode,
    semester,
    type: Actions.Schedule.RemoveCourse,
  };
}
