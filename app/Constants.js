'use strict';

module.exports = {

  Colors: {
    garnet: '#8F001A',
    darkGrey: '#80746C',
    polarGrey: '#F2F2F2',
    lightGrey: '#ACA39A',
    charcoalGrey: '#2D2D2C',
    transparent: 'rgba(0, 0, 0, 0)',
    rootElementBorder: 'rgba(0, 0, 0, 0.25)',
    defaultComponentBackgroundColor: 'rgba(0,0,0,0.4)',
    primaryWhiteText: 'white',
    secondaryWhiteText: 'rgba(255, 255, 255, 0.7)',
    primaryBlackText: 'black',
    secondaryBlackText: 'rgba(0, 0, 0, 0.7)',
  },

  /*
   * NOTE: When adding a new view here, make sure you also update app/util/ScreenUtils.js
   */
  Views: {

    /*
     * TODO: Change default to 100
     */
    Default: 300,
    Splash: 1,
    Main: 2,
    Find: {
      Home: 100,
      Building: 101,
      Search: 102,
    },
    Schedule: {
      Home: 200,
      Editor: 201,
    },
    Discover: {
      Home: 300,
      BusCampuses: 301,
      BusCampusStops: 302,
    },
    Settings: {
      Home: 400,
    },
  },
};
