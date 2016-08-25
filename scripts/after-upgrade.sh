#!/bin/sh

# Append additional files and directories to ignore
echo "
# Assets
/assets/
/scraper/
strings_secret.xml

# Code coverage
coverage/

# Build/bundle
ios/main.jsbundle

# Keystores
*/keystores/*

# Environment
js/env.js" >> .gitignore

# Update the package name of the app
sed -i '' 's/com\.campusguide/ca.josephroque.campusguide/g' ./android/app/build.gradle

# Update .flowconfig to map filenames
sed -i '' 's/[[]options[]]/[options]\'$'\n''module.name_mapper='"'"'env'"'"' -> '"'"'empty\/object'"'"'\'$'\n''module.name_mapper='"'"'.*\/assets\/csv\/.*'"'"' -> '"'"'empty\/object'"'"'\'$'\n''module.name_mapper='"'"'.*\/assets\/js\/.*'"'"' -> '"'"'empty\/object'"'"'\'$'\n''module.name_mapper='"'"'.*\/assets\/json\/.*'"'"' -> '"'"'empty\/object'"'"'\'$'\n''/g' ./.flowconfig

# Add additional flow ignore comment
sed -i '' 's/suppress_type=[$]FixMe/suppress_type=$FixMe\'$'\n''\'$'\n''suppress_comment=\\\\(.\\\\|\\n\\\\)*\\\\$FlowIgnore\'$'\n''/g' ./.flowconfig

# Remove the MainActivity files added in the new package
rm -r ./android/app/src/main/java/com/

# Link react-native dependencies
react-native link react-native-vector-icons
react-native link react-native-maps
react-native link react-native-orientation
react-native link react-native-device-info
react-native link react-native-fs
react-native link react-native-sqlite-storage
react-native link react-native-admob
