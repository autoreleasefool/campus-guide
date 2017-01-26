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
 * @created 2016-10-09
 * @file Database.js
 * @providesModule Database
 * @description Provides interactions with the application database.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  ConfigFile,
  Course,
  Lecture,
} from 'types';

// Imports
import Promise from 'promise';
import * as ArrayUtils from 'ArrayUtils';
import * as store from 'react-native-simple-store';

/** Identifier for storing Configuration file versions.  */
const STORE_CONFIG_VERSIONS = 'configFiles';

/** Identifier for storing user schedule. */
const STORE_SCHEDULE = 'schedule';

/**
 * Returns the user's full schedule.
 *
 * @returns {Promise<Object>} a promise which resolves with a set of semesters mapped to their
 *                            respective courses and schedules, as designated by the user
 */
export function getSchedule(): Promise < Object > {
  return store.get(STORE_SCHEDULE)
      .then((schedule) => {
        return schedule;
      });
}

/**
 * Overrides the user's schedule, saving it.
 *
 * @param {Object} schedule the schedule to save
 * @returns {Promise<void>} a promise which resolves when the schedule has been saved
 */
export function saveSchedule(schedule: Object): Promise < void > {
  return store.save(STORE_SCHEDULE, schedule);
}

/**
 * Adds a semester to the database. Semesters are uniquely defined by their ID, so if a semester
 * already exists, it is overwritten.
 *
 * @param {string}         id      unique id for the semester
 * @param {?string}        nameEn  English name of the semester. Optional.
 * @param {?string}        nameFr  French name of the semester. Optional.
 * @param {?Array<Course>} courses a list of courses the user has in the semester. Optional.
 * @returns {Promise<void>} a promise which resolves when the semester has been saved
 */
// export function addSemester(
//     id: string,
//     nameEn: ?string,
//     nameFr: ?string,
//     courses: ?Array < Course > = []): Promise < void > {
//   return store.get(STORE_SCHEDULE)
//       .then((schedule) => {
//         let updatedSchedule = schedule;
//         if (updatedSchedule == null) {
//           updatedSchedule = {};
//         }

//         updatedSchedule[id] = {
//           name_en: nameEn,
//           name_fr: nameFr,
//           courses,
//         };

//         return store.save(STORE_SCHEDULE, updatedSchedule);
//       });
// }

/**
 * Adds a course to the database. Courses are uniquely defined within a semester by their code, so if a course
 * already exists, it is overwritten.
 *
 * @param {string}         semesterId semester the course belongs to. If the semester does not exist, throws an error
 * @param {?string}        code       unique code of the course
 * @param {Array<Lecture>} lectures   list of lectures in the course
 * @returns {Promise<void>} a promise which resolves when the course has been saved
 */
// export function addCourse(semesterId: string, code: string, lectures: Array < Lecture > = []): Promise < void > {
//   return store.get(STORE_SCHEDULE)
//       .then((schedule) => {
//         if (!(semesterId in schedule)) {
//           throw new Error(`Semester '${semesterId}' does not exist.`);
//         }

//         const semester = schedule[semesterId];
//         const newCourse = {
//           code,
//           lectures,
//         };

//         // Insert the course in sorted order
//         const lowerCaseCode = code.toLowerCase();
//         let inserted = false;
//         for (let i = 0; !inserted && i < semester.courses.length; i++) {
//           const currentCourseLowerCase = semester.courses[i].code.toLowerCase();
//           if (currentCourseLowerCase > lowerCaseCode) {
//             inserted = true;
//             semester.courses.splice(i, 0, newCourse);
//           } else if (currentCourseLowerCase == lowerCaseCode) {
//             inserted = true;
//             semester.courses[i] = newCourse;
//           }
//         }

//         if (!inserted) {
//           schedule[semesterId].courses.push(newCourse);
//         }

//         return store.save(STORE_SCHEDULE, schedule);
//       });
// }

/**
 * Gets a list of config files and their versions from the database.
 *
 * @returns {Promise<Array<ConfigFile>>} a promise which resolves with a list of config file names and versions, or null
 */
export function getConfigVersions(): Promise < Array < ConfigFile > > {
  return store.get(STORE_CONFIG_VERSIONS)
      .then((configVersions) => {
        return ArrayUtils.sortObjectArrayByKeyValues(configVersions, 'name');
      });
}

/**
 * Update versions in the database for config files provided.
 *
 * @param {ConfigFile} update set of config files and versions
 * @returns {Promise<void>} promise which resolves when all updates have finished
 */
export function updateConfigVersions(update: Array < ConfigFile >): Promise < void > {
  return store.get(STORE_CONFIG_VERSIONS)
      .then((original: Array < ConfigFile >) => {
        let final = update;

        if (original != null) {
          const sorted = ArrayUtils.sortObjectArrayByKeyValues(original, 'name');

          // Replace any config versions that should be updated
          for (let i = 0; i < update.length; i++) {
            const index = ArrayUtils.searchObjectArrayByKeyValue(sorted, 'name', update[i].name);
            if (index >= 0) {
              sorted.splice(index, 1);
            }
          }

          final = final.concat(sorted);
        }

        // Save the updated config files
        return store.save(STORE_CONFIG_VERSIONS, final);
      });
}
