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
rnpm link react-native-vector-icons
rnpm link react-native-maps
rnpm link react-native-orientation
rnpm link react-native-device-info
rnpm link react-native-fs
rnpm link react-native-sqlite-storage
