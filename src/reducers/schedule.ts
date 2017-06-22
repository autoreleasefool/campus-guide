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
 * @description Reducers for schedule actions
 */
'use strict';

// Imports
import * as Actions from '../actionTypes';
import * as Arrays from '../util/Arrays';

/** Schedule reducer state. */
interface State {
  semesters: object; // The user's defined schedule
}

/** Initial schedule state. */
const initialState: State = {
  semesters: {},
};

/**
 * When provided with a schedule action, parses the parameters and returns an updated state.
 *
 * @param {State} state  the current state
 * @param {any}   action the action being taken
 * @returns {State} an updated state based on the previous state and the action taken
 */
export default function schedule(state: State = initialState, action: any): State {
  switch (action.type) {
    case Actions.Schedule.Load:
      return {
        ...state,
        semesters: action.schedule,
      };
    case Actions.Schedule.AddSemester: {
      const semesters = JSON.parse(JSON.stringify(state.semesters));
      semesters[action.semester.id] = action.semester;
      semesters[action.semester.id].courses = [];

      return {
        ...state,
        semesters,
      };
    }
    case Actions.Schedule.AddCourse: {
      if (!(action.semester in state.semesters)) {
        return state;
      }

      const semesters = JSON.parse(JSON.stringify(state.semesters));
      const courses = semesters[action.semester].courses;

      // Find the course if it already exists
      const position = Arrays.binarySearchObjectArrayByKeyValue(courses, 'code', action.course.code);

      if (position >= 0) {
        // Overwrite the course if it exists
        courses[position] = action.course;
      } else {
        // Add the course to the list and sort if it does not exist
        courses.push(action.course);
        Arrays.sortObjectArrayByKeyValues(courses, 'code');
      }

      return {
        ...state,
        semesters,
      };
    }
    case Actions.Schedule.RemoveCourse: {
      if (!(action.semester in state.semesters)) {
        return state;
      }

      const semesters = JSON.parse(JSON.stringify(state.semesters));
      const courses = semesters[action.semester].courses;

      // Find the course if it exists and delete it
      const position = Arrays.binarySearchObjectArrayByKeyValue(courses, 'code', action.courseCode);
      if (position >= 0) {
        courses.splice(position, 1);
      }

      return {
        ...state,
        semesters,
      };
    }
    default:
      return state;
  }
}
