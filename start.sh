#!/bin/bash
unzip data.zip
node process.js
node minimap.js
node generate.js

rm out.png
