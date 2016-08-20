#!/bin/bash

# Check for server running
ps | grep "node ./build/server.js" | grep -v grep

# If the server's not running, start it
if [ $? -ne 0 ]; then
  osascript -e 'tell application "Terminal" to do script "workspace;cd campus-guide-server;npm start"'
fi

# Run the iOS command
react-native "$1"