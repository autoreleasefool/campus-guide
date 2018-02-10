#!/bin/sh

# Script to run after upgrading React Native

# Append additional files and directories to ignore
echo "
# Assets
/assets/
**/ios/**/assets/**

# Config
**/android/**/assets/config/**
**/ios/**/config.bundle/**

# Code coverage
coverage/

# Build/bundle
release/

# Keystores
*/keystores/*

# Typescript output
artifacts/
" >> .gitignore

# Update the package name of the app
sed -i '' 's/com\.campusguide/ca.josephroque.campusguide/g' ./android/app/build.gradle
sed -i '' 's/com\.campusguide/ca.josephroque.campusguide/g' ./android/app/src/main/AndroidManifest.xml
sed -i '' 's/com\.campusguide/ca.josephroque.campusguide/g' ./android/app/BUCK

# Remove the MainActivity files added in the new package
rm -r ./android/app/src/main/java/com/

# Link react-native dependencies
react-native link react-native-vector-icons
react-native link react-native-maps
react-native link react-native-device-info
react-native link react-native-fs
react-native link react-native-snackbar
react-native link react-native-zip-archive
react-native link react-native-fabric
react-native link react-native-geolocation-service

sh ./script/after-yarn.sh
