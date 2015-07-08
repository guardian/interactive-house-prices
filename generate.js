var common = require('./common');
var fs = require('fs');
var Canvas = require('canvas');
var GIFEncoder = require('gifencoder');

var d3 = require('d3');
require("d3-geo-projection")(d3);

var IMG_WIDTH = 400;
var IMG_HEIGHT = 700;
var THRESHOLD = 25000 * 4;


