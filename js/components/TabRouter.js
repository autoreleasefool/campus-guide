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
 * @file TabRouter.js
 * @module TabRouter
 * @description Manages view changes in the application. Common to Android and iOS.
 *
 * @flow
 */
// React imports
import React from 'react';
import {
  View,
} from 'react-native';

// Type imports
import type {
  DefaultFunction,
  Route,
} from '../types';

// Imports
const Constants = require('../Constants');

// Screen imports
const BuildingDetails = require('../views/find/BuildingDetails');
const BusCampusDetails = require('../views/discover/BusCampusDetails');
const BusCampusList = require('../views/discover/BusCampusList');
const DetailsScreen = require('./DetailsScreen');
const DiscoverHome = require('../views/discover/DiscoverHome');
const FindHome = require('../views/find/FindHome');
const LinkCategory = require('../views/discover/LinkCategory');
const LinksHome = require('../views/discover/LinksHome');
const ScheduleHome = require('../views/schedule/ScheduleHome');
const SettingsHome = require('../views/settings/SettingsHome');
const ShuttleCampusList = require('../views/discover/ShuttleCampusList');
const ShuttleCampusDetails = require('../views/discover/ShuttleCampusDetails');

module.exports = {

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route                     object with properties to identify the route to display.
   * @param {DefaultFunction} changeTabs      function to change tabs in the tab manager.
   * @param {DefaultFunction} navigateForward function to navigate to a new screen in the tab manager.
   * @param {DefaultFunction} refreshNavbar   function to update the NavBar.
   * @returns {ReactElement<any>} the view to render, based on {route}.
   */
  renderScene(route: Route,
      changeTabs: (tabId: number) => any,
      navigateForward: (screenId: number | string, data: any) => any,
      refreshNavbar: DefaultFunction): ReactElement<any> {
    let scene = null;
    if (route.id === Constants.Views.Find.Home) {
      scene = (
        <FindHome
            onEditSchedule={() => changeTabs(Constants.Views.Schedule.Home)}
            onShowBuilding={buildingCode => navigateForward(Constants.Views.Find.Building, buildingCode)} />
      );
    } else if (route.id === Constants.Views.Find.Building) {
      scene = (
        <BuildingDetails buildingDetails={route.data} />
      );
    } else if (route.id === Constants.Views.Schedule.Home) {
      scene = (
        <ScheduleHome
            editSchedule={() => navigateForward(Constants.Views.Schedule.Editor)}
            requestTabChange={changeTabs} />
      );
    } else if (route.id === Constants.Views.Discover.Home) {
      scene = (
        <DiscoverHome onScreenSelected={navigateForward} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusList) {
      scene = (
        <BusCampusList
            showCampus={(name, color) =>
                navigateForward(Constants.Views.Discover.BusCampusDetails, {name: name, color: color})} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusDetails) {
      scene = (
        <BusCampusDetails
            campusColor={route.data.color}
            campusName={route.data.name} />
      );
    } else if (route.id === Constants.Views.Discover.LinksHome) {
      scene = (
        <LinksHome
            showLinkCategory={category =>
                navigateForward(Constants.Views.Discover.LinkCategory + '-0',
                    {category: category, categoryImage: category.image, index: 0})} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleCampusList) {
      scene = (
        <ShuttleCampusList
            showCampus={(campusName, campusColor) =>
                navigateForward(Constants.Views.Discover.ShuttleCampusDetails,
                    {name: campusName, color: campusColor})}
            showDetails={(title, image, text, backgroundColor) =>
                navigateForward(Constants.Views.Discover.ShuttleInfo,
                    {title: title, image: image, text: text, backgroundColor: backgroundColor})} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleCampusDetails) {
      scene = (
        <ShuttleCampusDetails
            campusColor={route.data.color}
            campusName={route.data.name} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleInfo) {
      scene = (
        <DetailsScreen
            backgroundColor={route.data.backgroundColor}
            image={route.data.image}
            text={route.data.text}
            title={route.data.title} />
      );
    } else if (route.id === Constants.Views.Settings.Home) {
      scene = (
        <SettingsHome
            refreshParent={refreshNavbar}
            requestTabChange={changeTabs} />
      );
    } else if (typeof route.id === 'string' && route.id.indexOf(Constants.Views.Discover.LinkCategory + '-') === 0) {
      scene = (
        <LinkCategory
            category={route.data.category}
            categoryImage={route.data.categoryImage}
            showLinkCategory={category =>
                navigateForward(Constants.Views.Discover.LinkCategory + '-' + (route.data.index + 1),
                    {category: category, categoryImage: route.data.categoryImage, index: route.data.index + 1})} />
      );
    }

    return (
      <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
        {scene}
      </View>
    );
  },
};
