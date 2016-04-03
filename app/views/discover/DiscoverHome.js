/*
 * Root view for links which help users become acquainted with the school.
 */
'use strict';

const React = require('react-native');
const {
  Component,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} = React;

const Configuration = require('../../util/Configuration');
const Constants = require('../../Constants');
const LanguageUtils = require('../../util/LanguageUtils');
const Preferences = require('../../util/Preferences');
const SectionHeader = require('../../components/SectionHeader');
const Styles = require('../../Styles');

class DiscoverHome extends Component {

  /*
   * Properties which the parent component should make available to this component.
   */
  static propTypes = {
    onScreenSelected: React.PropTypes.func.isRequired,
  };

  /*
   * Pass props and declares initial state.
   */
  constructor(props) {
    super(props);
    this.state = {
      sections: null,
    };

    // Initialize a default section
    this.currentSection = 0;

    // Explicitly binding 'this' to all methods that need it
    this._loadDiscoverSections = this._loadDiscoverSections.bind(this);
    this._getSectionView = this._getSectionView.bind(this);
  };

  _getSectionView(section) {
    let onPress = null;
    if (section.id === 'pop') {
      onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
    } else if (section.id === 'stu') {
      onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
    } else if (section.id === 'use') {
      onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
    } else if (section.id === 'bus') {
      onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
    } else if (section.id === 'shu') {
      onPress = () => this.props.onScreenSelected(Constants.Views.Discover.BusCampuses);
    }

    let sectionImage = null;
    let touchableStyle = {};
    if (section.id === this.currentSection) {
      sectionImage = (
        // <View style={{flex: 1, backgroundColor: Constants.Colors.garnet, position: 'absolute', left: 0, top: 0, bottom: 0, right: 0}} />
        <Image
            style={{flex: 1, position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}
            resizeMode={'cover'}
            source={section.image} />
      );
      touchableStyle = {flex: 1, overflow: 'hidden'};
      console.log('Current section:', this.currentSection);

    }

    return (
      <TouchableOpacity onPress={onPress} key={section.id} style={touchableStyle}>
        {sectionImage}
        <SectionHeader
            sectionName={LanguageUtils.getTranslatedName(Preferences.getSelectedLanguage(), section)}
            sectionIcon={section.icon}
            sectionIconClass={section.icon_class}
            subtitleIcon={'chevron-right'}
            subtitleIconClass={'material'} />
      </TouchableOpacity>
    );
  }

  _loadDiscoverSections() {
    let sections = require('../../../assets/static/js/DiscoverSections');
    this.currentSection = sections[0].id;
    this.setState({
      sections: sections,
    });
  };

  componentDidMount() {
    if (this.state.sections === null) {
      this._loadDiscoverSections();
    }
  };

  render() {
    if (this.state.sections === null) {
      return (
        <View style={_styles.container} />
      );
    } else {
      return (
        <View style={_styles.container}>
          {this.state.sections.map(section => (
            this._getSectionView(section)
          ))}
        </View>
      );
    }
  };
};

// Private styles for component
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.Colors.darkGrey
  }
});

// Expose component to app
module.exports = DiscoverHome;
