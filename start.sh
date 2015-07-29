#!/bin/bash
unzip data.zip
node districts.js
node country.js
node minimap.js

rm out.png
