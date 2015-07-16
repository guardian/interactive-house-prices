#!/bin/bash
unzip data.zip
node districts.js
node minimap.js
node generate.js

rm out.png
