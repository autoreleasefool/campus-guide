sed -i '' '81s/.*//' ./node_modules/asap/raw.js
sed -i '' '12s/.*/#import <RCTComponent.h>/' ./node_modules/react-native-maps/ios/AirMaps/AIRMap.h
sed -i '' '7s/.*/#import "RCTView.h"/' ./node_modules/react-native-maps/ios/AirMaps/AIRMapCallout.h
