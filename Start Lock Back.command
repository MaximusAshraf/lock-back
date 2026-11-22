#!/bin/bash
# Double-click to start Lock Back on a Mac.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display dialog "Node.js is not installed. Install it from https://nodejs.org (LTS), then double-click this file again." buttons {"OK"} default button 1 with icon caution'
  open "https://nodejs.org"
  exit 1
fi
[ -d node_modules ] || npm install
# open the admin board once the server is up
( sleep 3; open "http://localhost:3080/admin" ) &
exec node launcher.js
