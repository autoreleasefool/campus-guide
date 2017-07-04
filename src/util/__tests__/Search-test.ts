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
 * @created 2017-06-30
 * @file Search-test.ts
 * @description Tests the search methods.
 */

// Require modules used in testing
import * as Search from '../Search';

// Mock translations for days
jest.mock('../../../assets/json/CoreTranslations.json', () => ({
  en: {
    friday: 'Day',
    monday: 'Day',
    saturday: 'Day',
    sunday: 'Day',
    thursday: 'Day',
    tuesday: 'Day',
    wednesday: 'Day',
  },
  fr: {
    friday: 'Jour',
    monday: 'Jour',
    saturday: 'Jour',
    sunday: 'Jour',
    thursday: 'Jour',
    tuesday: 'Jour',
    wednesday: 'Jour',
  },
}));

// Explicit types
import { GridImage } from '../../../typings/global';
import { Building, BuildingRoom, RoomTypeId, StudySpot, StudySpotFilterId } from '../../../typings/university';

// Rooms to filter
const rooms: BuildingRoom[] = [{
  alt_name: 'AltName',
  name: 'Room1',
  type: 'meet',
}, {
  alt_name_en: 'English',
  alt_name_fr: 'French',
  name: 'Room2',
  type: 'class',
}, {
  name: 'Room3',
}];

describe('Search-test', () => {

  it('tests filtering grid images', () => {

    // GridImages to filter
    const gridImages: GridImage[] = [{
      image: 'GridImage1.jpg',
      name: 'GridImage 1',
      shorthand: 'GI',
      thumbnail: 'GI.jpg',
    }, {
      image: 'GridImage2.jpg',
      name_en: 'English',
      name_fr: 'French',
    }];

    // Test shorthands
    let result = Search.filterGridImage('en', 'GI', gridImages[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['GI']);

    result = Search.filterGridImage('en', 'GI', gridImages[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test names
    result = Search.filterGridImage('en', 'GRID', gridImages[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['GRIDIMAGE 1']);

    result = Search.filterGridImage('en', 'GI', gridImages[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test French/English names
    result = Search.filterGridImage('en', 'ENG', gridImages[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterGridImage('en', 'ENG', gridImages[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['ENGLISH']);

    result = Search.filterGridImage('fr', 'ENG', gridImages[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterGridImage('fr', 'ENG', gridImages[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test lowercase
    for (const gridImage of gridImages) {
      result = Search.filterGridImage('en', 'grid', gridImage);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterGridImage('en', 'grid', gridImage);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

  });

  it('tests filtering study spots', () => {
    // Room types to filter with
    const filters: StudySpotFilterId[][] = [[
      'individual',
      'silent',
    ], [
      'individual',
      'outlets',
    ]];

    const studySpots: StudySpot[] = [{
      building: 'MRN',
      closes: '23:00',
      description: 'Spot1Description',
      filters: filters[0],
      image: 'Spot1.jpg',
      name: 'Spot1Name',
      opens: '09:00',
      room: 'Spot1Room',
    }, {
      building: 'UCU',
      closes: '22:00',
      description_en: 'Spot2EnglishDescription',
      description_fr: 'Spot2FrenchDescription',
      filters: filters[1],
      image: 'Spot2.jpg',
      name_en: 'EnglishName',
      name_fr: 'FrenchName',
      opens: '10:00',
      room: 'Spot2Room',
    }];

    // Test name
    let result = Search.filterStudySpot('en', studySpots[0].name.toUpperCase(), studySpots[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([studySpots[0].name.toUpperCase()]);

    result = Search.filterStudySpot('en', studySpots[0].name.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('en', studySpots[1].name_en.toUpperCase(), studySpots[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([studySpots[1].name_en.toUpperCase()]);

    result = Search.filterStudySpot('fr', studySpots[1].name_en.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('en', studySpots[1].name_fr.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('fr', studySpots[1].name_fr.toUpperCase(), studySpots[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([studySpots[1].name_fr.toUpperCase()]);

    // Test description
    result = Search.filterStudySpot('en', studySpots[0].description.toUpperCase(), studySpots[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('en', studySpots[0].description.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('en', studySpots[1].description_en.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('fr', studySpots[1].description_en.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('en', studySpots[1].description_fr.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterStudySpot('fr', studySpots[1].description_fr.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test building
    result = Search.filterStudySpot('en', studySpots[0].building.toUpperCase(), studySpots[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([studySpots[0].building.toUpperCase()]);

    result = Search.filterStudySpot('en', studySpots[0].building.toUpperCase(), studySpots[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test times
    for (const studySpot of studySpots) {
      result = Search.filterStudySpot('en', 'JPG', studySpot);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

    // Test image
    for (const studySpot of studySpots) {
      result = Search.filterStudySpot('en', studySpots[0].opens, studySpot);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterStudySpot('en', studySpots[1].opens, studySpot);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterStudySpot('en', studySpots[0].closes, studySpot);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterStudySpot('en', studySpots[1].closes, studySpot);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }
  });

  it('tests filtering buildings', () => {

    // Buildings to filter
    const buildings: Building[] = [{
      address: 'Building1Address',
      facilities: [ 'parking' ],
      image: 'Building1.jpg',
      location: {
        latitude: 99,
        longitude: 101,
      },
      name: 'Building1',
      rooms,
      shorthand: 'B1',
      thumbnail: 'B1.jpg',
    }, {
      address: 'Building2Address',
      facilities: [],
      image: 'Building2.jpg',
      location: {
        latitude: 99,
        longitude: 101,
      },
      name_en: 'English',
      name_fr: 'French',
      rooms: [],
      shorthand: 'B2',
      thumbnail: 'B2.jpg',
    }];

    // Test shorthands
    let result = Search.filterBuilding('en', buildings[0].shorthand.toUpperCase(), buildings[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([buildings[0].shorthand.toUpperCase()]);

    result = Search.filterBuilding('en', buildings[0].shorthand.toUpperCase(), buildings[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test names
    result = Search.filterBuilding('en', buildings[0].name.toUpperCase(), buildings[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([buildings[0].name.toUpperCase()]);

    result = Search.filterBuilding('en', buildings[0].name.toUpperCase(), buildings[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test French/English names
    result = Search.filterBuilding('en', buildings[1].name_en.toUpperCase(), buildings[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterBuilding('en', buildings[1].name_en.toUpperCase(), buildings[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual([buildings[1].name_en.toUpperCase()]);

    result = Search.filterBuilding('fr', buildings[1].name_en.toUpperCase(), buildings[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterBuilding('fr', buildings[1].name_en.toUpperCase(), buildings[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test lowercase
    for (const building of buildings) {
      result = Search.filterBuilding('en', 'build', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('en', 'build', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

    // Test addresses
    for (const building of buildings) {
      const address = building.address || building.address_en || building.address_fr || 'ADDRESS';
      result = Search.filterBuilding('en', address, building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('fr', address, building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

    // Test location
    for (const building of buildings) {
      result = Search.filterBuilding('en', '99', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('en', '101', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('fr', '99', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('fr', '101', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

    // Test rooms
    for (const building of buildings) {
      result = Search.filterBuilding('en', 'ROOM', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('fr', 'ROOM', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

    // Test images
    for (const building of buildings) {
      result = Search.filterBuilding('en', 'JPG', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);

      result = Search.filterBuilding('fr', 'JPG', building);
      expect(result.success).toBeFalsy();
      expect(result.matches).toEqual([]);
    }

  });

  it('tests filtering rooms', () => {
    // Room types to filter with
    const roomTypeLists: RoomTypeId[][] = [[
      'meet',
      'office',
      'kitchen',
    ], [
      'bath_uni',
      'meet',
      'class',
    ]];

    const roomTypes1 = new Set(roomTypeLists[0]);
    const roomTypes2 = new Set(roomTypeLists[1]);

    // Test shorthands
    let result = Search.filterRoom('en', 'B1', new Set(), 'B1', rooms[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['B1 ROOM1']);

    result = Search.filterRoom('en', 'B1', new Set(), 'B1', rooms[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['B1 ROOM2']);

    result = Search.filterRoom('en', 'B1', new Set(), 'B1', rooms[2]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['B1 ROOM3']);

    // Test names
    result = Search.filterRoom('en', 'ROOM1', new Set(), 'B1', rooms[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['B1 ROOM1']);

    result = Search.filterRoom('en', 'ROOM1', new Set(), 'B1', rooms[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterRoom('en', 'ROOM1', new Set(), 'B1', rooms[2]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test alternative names
    result = Search.filterRoom('en', 'ALTNAME', new Set(), 'B1', rooms[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['ALTNAME']);

    result = Search.filterRoom('en', 'ALTNAME', new Set(), 'B1', rooms[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterRoom('en', 'ALTNAME', new Set(), 'B1', rooms[2]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test English/French alternative names
    result = Search.filterRoom('en', 'ENG', new Set(), 'B1', rooms[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterRoom('en', 'ENG', new Set(), 'B1', rooms[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['ENGLISH']);

    result = Search.filterRoom('en', 'ENG', new Set(), 'B1', rooms[2]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterRoom('fr', 'FRE', new Set(), 'B1', rooms[0]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterRoom('fr', 'FRE', new Set(), 'B1', rooms[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['FRENCH']);

    result = Search.filterRoom('fr', 'FRE', new Set(), 'B1', rooms[2]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test room types
    result = Search.filterRoom('en', 'bad filter', roomTypes1, 'B1', rooms[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['MEET']);

    result = Search.filterRoom('en', 'bad filter', roomTypes1, 'B1', rooms[1]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    result = Search.filterRoom('en', 'bad filter', roomTypes1, 'B1', rooms[2]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['OFFICE']);

    result = Search.filterRoom('en', 'bad filter', roomTypes2, 'B1', rooms[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['MEET']);

    result = Search.filterRoom('en', 'bad filter', roomTypes2, 'B1', rooms[1]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['CLASS']);

    result = Search.filterRoom('en', 'bad filter', roomTypes2, 'B1', rooms[2]);
    expect(result.success).toBeFalsy();
    expect(result.matches).toEqual([]);

    // Test multiple conditions met
    result = Search.filterRoom('en', 'B1', roomTypes1, 'B1', rooms[0]);
    expect(result.success).toBeTruthy();
    expect(result.matches).toEqual(['B1 ROOM1', 'MEET']);

  });

});
