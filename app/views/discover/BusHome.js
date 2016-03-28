/*
 * Displays the list of campuses with bus stop information.
 */
'use strict';

// Imports
const React = require('react-native');
const {
  Component,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} = React;

const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');

class BusHome extends Component {

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
      loaded: false,
    }
  };

  /*
   * Loads a list of campus names and images representing them.
   */
  _loadCampuses() {
    let campuses = require('../../../assets/static/js/Campuses');
    this.setState({
      campuses: campuses,
      loaded: true,
    });
  };

  componentDidMount() {
    if (!this.state.loaded) {
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

    let campusDisplayNames = ['nil', 'nil', 'nil', 'nil'];
    let campusStopNames = ['nil', 'nil', 'nil', 'nil'];
    let campusImages = [null, null, null, null];

    // If the campuses have been loaded, parse the data
    if (this.state.loaded) {
      for (let campus in this.state.campuses) {
        campusDisplayNames[campus] = LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), this.state.campuses[campus]);
        campusStopNames[campus] = LanguageUtils.getEnglishName(this.state.campuses[campus]);
        campusImages[campus] = (
          <Image
              style={{flex: 1}}
              resizeMode={'cover'}
              source={this.state.campuses[campus].image} />
        );
      }
    }

    return (
      <View style={_styles.container}>
        <TouchableOpacity onPress={() => this.props.showCampus(campusStopNames[0])} style={_styles.campusContainer}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.garnet}}>
            <SectionHeader sectionName={campusDisplayNames[0]} />
            {campusImages[0]}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.props.showCampus(campusStopNames[1])} style={_styles.campusContainer}>
          <View style={{flex: 1, backgroundColor: Constants.Colors.charcoalGrey}}>
            <SectionHeader sectionName={campusDisplayNames[1]} />
            {campusImages[1]}
          </View>
        </TouchableOpacity>
        <View style={_styles.campusContainer}>
          <TouchableOpacity onPress={() => this.props.showCampus(campusStopNames[2])} style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: Constants.Colors.lightGrey}}>
              <SectionHeader sectionName={campusDisplayNames[2]} />
              {campusImages[2]}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.showCampus(campusStopNames[3])} style={_styles.campusContainer}>
            <View style={{flex: 1, backgroundColor: Constants.Colors.darkGrey}}>
              <SectionHeader sectionName={campusDisplayNames[3]} />
              {campusImages[3]}
            </View>
          </TouchableOpacity>
        </View>
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
});

// Expose component to app
module.exports = BusHome;
