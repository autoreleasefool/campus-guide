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
 * @file Database.js
 * @providesModule Database
 * @description Provides interations with the application database.
 *
 * @flow
 */
'use strict';

// Type imports
import type {
  ConfigFile,
  Course,
} from 'types';

const store = require('react-native-simple-store');

// Imports
const ArrayUtils = require('ArrayUtils');
const Promise = require('promise');

/** Identifier for storing Configuration file versions.  */
const STORE_CONFIG_VERSIONS = 'configFiles';

/** Identifier for storing semester courses, by their code. */
const STORE_SEMESTER = 'semester{0}';

/**
 * Gets a list of config files and their versions from the database.
 *
 * @returns {Promise<Array<ConfigFile>>} a promise which resolves with a list of config file names and versions, or null
 */
export function getConfigVersions(): Promise < Array < ConfigFile > > {
  return store.get(STORE_CONFIG_VERSIONS)
      .then(configVersions => {
        return ArrayUtils.sortObjectArrayByKeyValues(configVersions, 'name');
      });
}

/**
 * Update versions in the database for config files provided.
 *
 * @param {ConfigFile} updatedConfigFiles set of config files and versions
 * @returns {Promise<void>} promise which resolves when all updates have finished
 */
export function updateConfigVersions(updatedConfigFiles: Array < ConfigFile >): Promise < void > {
  return store.get(STORE_CONFIG_VERSIONS)
      .then(configFiles => {
        let updated = updatedConfigFiles;

        if (configFiles != null) {
          const sortedConfigFiles = ArrayUtils.sortObjectArrayByKeyValues(configFiles, 'name');

          // Replace any config versions that should be updated
          for (let i = 0; i < updatedConfigFiles.length; i++) {
            const index = ArrayUtils.searchObjectArrayByKeyValue(sortedConfigFiles, 'name', updatedConfigFiles[i].name);
            if (index >= 0) {
              sortedConfigFiles.splice(index, 1);
            }
          }

          updated = updated.concat(sortedConfigFiles);
        }

        // Save the updated config files
        return store.save(STORE_CONFIG_VERSIONS, updated);
      });
}

/**
 * Get a list of courses belonging to a certain semester, and the lectures for those courses.
 *
 * @param {string} semesterCode code which identifies semester to retrieve courses for
 * @returns {Promise<void>} promise which resolves when courses and their lectures have been retrieved
 */
export function getCoursesForSemester(semesterCode: string): Promise < Array < Course > > {
  const semesterKey: string = (String:any).format(STORE_SEMESTER, semesterCode);
  return store.get(semesterKey);
}

/**
 * Stores a new course in the database, under the semester specified.
 *
 * @param {string} semesterCode code which identifies semester to save course under
 * @param {Course} course       course name and its lectures to save
 * @returns {Promise<void>} promise which resolves when courses and their lectures have been saved
 */
export function addCourse(semesterCode: string, course: Course): Promise < void > {
  const semesterKey: string = (String:any).format(STORE_SEMESTER, semesterCode);
  return store.get(semesterKey)
      .then(courses => {
        courses.push(course);
        return store.save(semesterKey, courses);
      });
}

/**
 * Updates a course in the database. The course is NOT added if it is not already present in the database.
 *
 * @param {string} semesterCode code which identifies semester to save course under
 * @param {Course} course       course name and its lectures to update
 * @returns {Promise<void>} promise which resolves when courses and their lectures have been saved
 */
export function replaceCourse(semesterCode: string, course: Course): Promise < void > {
  const semesterKey: string = (String:any).format(STORE_SEMESTER, semesterCode);
  return store.get(semesterKey)
      .then(courses => {
        for (let i = 0; i < courses.length; i++) {
          if (courses[i].name === course.name) {
            courses[i].lectures = course.lectures;
            break;
          }
        }

        return store.save(semesterKey, courses);
      });
}

/**
 * Removes a course in the database from the semester it is saved under.
 *
 * @param {string} semesterCode code which identifies semester course is saved under
 * @param {Course} course       course name and its lectures to delete
 * @returns {Promise<void>} promise which resolves when courses and their lectures have been deleted
 */
export function deleteCourse(semesterCode: string, course: Course): Promise < void > {
  const semesterKey: string = (String:any).format(STORE_SEMESTER, semesterCode);
  return store.get(semesterKey)
      .then(courses => {
        for (let i = 0; i < courses.length; i++) {
          if (courses[i].name === course.name) {
            courses.splice(i, 1);
            break;
          }
        }

        return store.save(semesterKey, courses);
      });
}
