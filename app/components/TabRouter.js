// React Native imports
import React from 'react';
import {
  View,
} from 'react-native';

// Import type definitions.
import type {
  Route,
} from '../Types';

// Imports
const Constants = require('../Constants');

// Screen imports
const BuildingPage = require('../views/find/BuildingPage');
const BusCampusInfo = require('../views/discover/BusCampusInfo');
const BusCampusStops = require('../views/discover/BusCampusStops');
const DetailsScreen = require('./DetailsScreen');
const DiscoverHome = require('../views/discover/DiscoverHome');
const FindHome = require('../views/find/FindHome');
const LinkCategory = require('../views/discover/LinkCategory');
const LinksHome = require('../views/discover/LinksHome');
const ScheduleHome = require('../views/schedule/ScheduleHome');
const ScheduleEditor = require('../views/schedule/ScheduleEditor');
const SettingsHome = require('../views/settings/SettingsHome');
const ShuttleCampusInfo = require('../views/discover/ShuttleCampusInfo');
const ShuttleInfo = require('../views/discover/ShuttleInfo');

module.exports = {

  /**
   * Renders a view according to the current route of the navigator.
   *
   * @param {Route} route object with properties to identify the route to display.
   * @returns {ReactElement} the view to render, based on {route}.
   */
  renderScene(route: Route, changeTabs, navigateForward, refreshNavbar): ReactElement {
    let scene = null;
    if (route.id === Constants.Views.Find.Home) {
      scene = (
        <FindHome
            onEditSchedule={() => changeTabs(Constants.Views.Schedule.Home)}
            onShowBuilding={buildingCode => navigateForward(Constants.Views.Find.Building, buildingCode)} />
      );
    } else if (route.id === Constants.Views.Find.Building) {
      scene = (
        <BuildingPage buildingDetails={route.data} />
      );
    } else if (route.id === Constants.Views.Schedule.Home) {
      scene = (
        <ScheduleHome
            editSchedule={() => navigateForward(Constants.Views.Schedule.Editor)}
            requestTabChange={changeTabs} />
      );
    } else if (route.id === Constants.Views.Schedule.Editor) {
      scene = (
        <ScheduleEditor />
      );
    } else if (route.id === Constants.Views.Discover.Home) {
      scene = (
        <DiscoverHome onScreenSelected={navigateForward} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusInfo) {
      scene = (
        <BusCampusInfo
            showCampus={(name, color) =>
                navigateForward(Constants.Views.Discover.BusCampusStops, {name: name, color: color})} />
      );
    } else if (route.id === Constants.Views.Discover.BusCampusStops) {
      scene = (
        <BusCampusStops
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
    } else if (route.id === Constants.Views.Discover.ShuttleInfo) {
      scene = (
        <ShuttleInfo
            showCampus={(campusName, campusColor) =>
                navigateForward(Constants.Views.Discover.ShuttleCampusInfo,
                    {name: campusName, color: campusColor})}
            showDetails={(title, image, text, backgroundColor) =>
                navigateForward(Constants.Views.Discover.ShuttleDetails,
                    {title: title, image: image, text: text, backgroundColor: backgroundColor})} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleCampusInfo) {
      scene = (
        <ShuttleCampusInfo
            campusColor={route.data.color}
            campusName={route.data.name} />
      );
    } else if (route.id === Constants.Views.Settings.Home) {
      scene = (
        <SettingsHome
            refreshParent={refreshNavbar}
            requestTabChange={changeTabs} />
      );
    } else if (route.id === Constants.Views.Discover.ShuttleDetails) {
      scene = (
        <DetailsScreen
            backgroundColor={route.data.backgroundColor}
            image={route.data.image}
            text={route.data.text}
            title={route.data.title} />
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
