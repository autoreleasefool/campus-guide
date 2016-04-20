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
 * @file
 * Types.js
 *
 * @description
 * Variable type definitions for use throughout the app.
 *
 * @author
 * Joseph Roque
 *
 * @external
 * @flow
 *
 */
'use strict';

export type TabIcons = {
  find: string,
  schedule: string,
  discover: string,
  settings: string,
};

type SemesterWithDefaultName = {
  code: string,
  current: boolean,
  name: string,
};

type SemesterWithTranslatedName = {
  code: string,
  current: boolean,
  name_en: string,
  name_fr: string,
};

export type Semester =
    | SemesterWithDefaultName
    | SemesterWithTranslatedName;

type UniversityWithDefaultName = {
  lat: number,
  long: number,
  name: string,
};

type UniversityWithTranslatedNames = {
  lat: number,
  long: number,
  name_en: string,
  name_fr: string,
};

export type University =
    | UniversityWithDefaultName
    | UniversityWithTranslatedNames;

type BusInfoWithDefault = {
  name: string,
  link: string,
};

type BusInfoWithTranslated = {
  name_en: string,
  name_fr: string,
  link_en: string,
  link_fr: string,
};

export type BusInfo =
    | BusInfoWithDefault
    | BusInfoWithTranslated;

type DefaultIcon = {
  icon: string,
  iconClass: string,
};

type AndroidIcon = {
  android: DefaultIcon,
};

type IOSIcon = {
  ios: DefaultIcon,
};

export type IconObject =
    | DefaultIcon
    | AndroidIcon
    | IOSIcon;

export type DefaultIconObject = DefaultIcon;

export type PlatformString =
    | 'ios'
    | 'android';

export type LanguageString =
    | 'en'
    | 'fr';
