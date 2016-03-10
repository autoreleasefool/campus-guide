/*
 * Initial entry view for the application. Allows the user to select their preferred language on first run.
 */
'use strict';

// React imports
const React = require('react-native');
const {
  AsyncStorage,
  Component,
  Dimensions,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} = React;

const Configuration = require('../util/Configuration');
const Constants = require('../Constants');
const Preferences = require('../util/Preferences');
const StatusBar = require('../util/StatusBar');
const Styles = require('../Styles');

// Require both language translations to display items in both languages
const TranslationsEn = require('../util/Translations.en.js');
const TranslationsFr = require('../util/Translations.fr.js');

class SplashScreen extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    navigator: React.PropTypes.object.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };

    // Explicitly binding 'this' to all methods that need it
    this._selectLanguage = this._selectLanguage.bind(this);
  };

  /*
   * Sets the language of the app and opens the main screen.
   */
  _selectLanguage(language) {
    Preferences.setSelectedLanguage(language);
    this.props.navigator.push({id: Constants.Views.Main});
  };

  /*
   * Calls the startup functions of the application.
   */
  componentDidMount() {
    const self = this;

    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    StatusBar.setLightStatusBarIOS(true);
    Configuration.getConfiguration();
    Preferences.loadInitialPreferences().done(function() {
      if (!Preferences.isLanguageSelected()) {
        self.setState({
          isLoading: false,
        });
      } else {
        // If a lanuage has been selected, remove this language select screen, open the main screen
        self.props.navigator.replace({id: 2});
        // TODO: comment above and uncomment below to always show splash screen
        // this.setState({
        //   isLoading: false
        // });
      }
    });
  };

  /*
   * Displays two buttons to allow the user to select French or English.
   */
  render() {
    // Get the width and height of the screen
    const {height, width} = Dimensions.get('window');
    const onlyOnceTextWidth = Math.min(width, 400);
    const onlyOnceTextLeft = (width - onlyOnceTextWidth) / 2;

    if (this.state.isLoading) {
      // While checking to see if a language has been selected, display an empty view
      return (
        <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}></View>
      );
    }

    return (
      <View style = {_styles.container}>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage('en')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
            <View style={_styles.languageContainer}>
              <Text style={[Styles.mediumText, {color: 'white'}]}>
                {TranslationsEn['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[Styles.titleText, {color: 'white'}]}>
                  {TranslationsEn['language']}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => this._selectLanguage('fr')}
            style={{flex: 1}}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}>
            <View style={_styles.languageContainer}>
              <Text style={[Styles.mediumText, {color: 'white'}]}>
                {TranslationsFr['continue_in']}
              </Text>
              <View style={{padding: 5}}>
                <Text style={[Styles.titleText, {color: 'white'}]}>
                  {TranslationsFr['language']}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000000',
  },
  languageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Expose component to app
module.exports = SplashScreen;
