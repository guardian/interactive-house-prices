#!/bin/bash
node generate.js
pngquant 8 out.png
mv out-fs8.png app/src/assets/intro.png
rm out.png
