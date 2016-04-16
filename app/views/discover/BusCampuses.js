/*
 * Displays the list of campuses with bus stop information.
 */
'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

const campuscolors = [Constants.Colors.garnet, Constants.Colors.charcoalGrey, Constants.Colors.lightGrey, Constants.Colors.darkGrey];

class BusCampuses extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    showCampus: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);

    this.state = {
      campuses: null,
    }
  };

  _goToOCTranspo() {
    if (Preferences.getSelectedLanguage() === 'fr') {
      Linking.openURL('http://www.octranspo1.com/acceuil');
    } else {
      Linking.openURL('http://www.octranspo1.com/');
    }
  };

  /*
   * Loads a list of campus names and images representing them.
   */
  _loadCampuses() {
    let campuses = require('../../../assets/static/js/BusCampuses');
    this.setState({
      campuses: campuses,
    });
  };

  componentDidMount() {
    if (this.state.campuses == null) {
      this._loadCampuses();
    }
  };

  render() {
    // Get current language for translations
    let Translations = null;
    if (Preferences.getSelectedLanguage() === 'fr') {
      Translations = require('../../../assets/static/js/Translations.fr.js');
    } else {
      Translations = require('../../../assets/static/js/Translations.en.js');
    }

    let campusDisplayNames = [null, null, null, null];
    let campusStopNames = [null, null, null, null];
    let campusImages = [null, null, null, null];

    // If the campuses have been loaded, parse the data
    if (this.state.campuses != null) {
      for (let campus in this.state.campuses) {
        campusDisplayNames[campus] = LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.state.campuses[campus]);
        campusStopNames[campus] = LanguageUtils.getEnglishName(this.state.campuses[campus]);
        campusImages[campus] = (
          <Image
              style={_styles.campusImage}
              resizeMode={'cover'}
              source={this.state.campuses[campus].image} />
        );
      }
    } else {
      return (
        <View style={_styles.container} />
      );
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity
            onPress={() => this.props.showCampus(campusStopNames[0], campuscolors[0])}
            style={_styles.campusContainer}>
          <View style={{flex: 1, backgroundColor: campuscolors[0]}}>
            <SectionHeader sectionName={campusDisplayNames[0]} />
            {campusImages[0]}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => this.props.showCampus(campusStopNames[1], campuscolors[1])}
            style={_styles.campusContainer}>
          <View style={{flex: 1, backgroundColor: campuscolors[1]}}>
            <SectionHeader sectionName={campusDisplayNames[1]} />
            {campusImages[1]}
          </View>
        </TouchableOpacity>
        <View style={_styles.campusContainer}>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[2], campuscolors[2])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campuscolors[2]}}>
              <SectionHeader sectionName={campusDisplayNames[2]} />
              {campusImages[2]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
              onPress={() => this.props.showCampus(campusStopNames[3], campuscolors[3])}
              style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: campuscolors[3]}}>
              <SectionHeader sectionName={campusDisplayNames[3]} />
              {campusImages[3]}
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
            onPress={this._goToOCTranspo}>
          <SectionHeader
              sectionName={Translations['bus_company']}
              sectionIcon={'android-open'}
              sectionIconClass={'ionicon'}
              subtitleIcon={'chevron-right'}
              subtitleIconClass={'material'}
              backgroundOverride={Constants.Colors.garnet} />
        </TouchableOpacity>
      </View>
    );
  };
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  campusContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  campusImage: {
    flex: 1,
    width: null,
    height: null,
  },
});

// Expose component to app
module.exports = BusCampuses;
