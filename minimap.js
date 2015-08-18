var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var Canvas = require('canvas');
var pngparse = require('pngparse');
var deasync = require('deasync');
var d3 = require('d3');
require('d3-geo-projection')(d3);

var IMG_WIDTH = 180;
var IMG_HEIGHT = 216;

var canvas = new Canvas(IMG_WIDTH, IMG_HEIGHT),
    ctx = canvas.getContext('2d');

var projection = d3.geo.mercator().scale(1).translate([0, 0]);
var path = d3.geo.path().projection(projection).context(ctx);

var b = path.bounds(common.validDistrictGeo),
    s = .95 / Math.max((b[1][0] - b[0][0]) / IMG_WIDTH, (b[1][1] - b[0][1]) / IMG_HEIGHT),
    t = [(IMG_WIDTH - s * (b[1][0] + b[0][0])) / 2, (IMG_HEIGHT - s * (b[1][1] + b[0][1])) / 2];

projection.scale(s).translate(t);

ctx.fillStyle = ctx.strokeStyle = '#e0e0e0';
path(common.validDistrictGeo);
ctx.fill('evenodd');
ctx.stroke();
common.writePNG(canvas, 'minimap/bg.png', 4);

var width = 0, height = 0;
var images = {};
common.validDistrictGeo.features.forEach(function (feature) {
    process.stdout.write('.');

    ctx.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

    ctx.strokeStyle = ctx.fillStyle = '#ed3d61';
    ctx.beginPath();
    path(feature);
    ctx.fill('evenodd');
    ctx.stroke();

    // We need to quantize the canvas before determining its x/y co-ordinates
    common.writePNG(canvas, 'minimap/' + feature.properties.name + '.png', 4);

    var imgData;
    pngparse.parseFile('app/src/assets/minimap/' + feature.properties.name + '.png', function (err, img) {
        imgData = img;
    });
    deasync.loopWhile(function() { return !imgData;} );

    var transparent = imgData.getPixel(0, 0);
    var xMin = 10000, yMin = 10000, xMax = 0, yMax = 0;
    var x, y;
    for (x = 0; x < imgData.width; x++) {
        for (y = 0; y < imgData.height; y++) {
            if (imgData.getPixel(x, y) !== transparent) {
                xMin = Math.min(xMin, x);
                yMin = Math.min(yMin, y);
                xMax = Math.max(xMax, x);
                yMax = Math.max(yMax, y);
            }
        }
    }

    width = Math.max(width, xMax - xMin);
    height = Math.max(height, yMax - yMin);

    images[feature.properties.name] = {
        x: xMin,
        y: yMin,
        fn: 'app/src/assets/minimap/' + feature.properties.name + '.png'
    };
});
process.stdout.write('\n');

console.log(width, height);

// Cairo can't handle PNGs with a large dimension, so we need to create
// multiple columns in our sprite
var codeChunks = _.chunk(common.districtCodes, common.districtCodes.length / 2);

var canvas = new Canvas(width * codeChunks.length, height * codeChunks[0].length);
    ctx = canvas.getContext('2d');

var positionChunks = codeChunks.map(function (codes, i) {
    ctx.save();

    var positions = codes.map(function (code) {
        var img = images[code];

        var imgEl = new Canvas.Image;
        imgEl.src = fs.readFileSync(img.fn);
        ctx.drawImage(imgEl, img.x, img.y, width, height, 0, 0, width, height);
        ctx.translate(0, height);

        return [img.x, img.y];
    });

    ctx.restore();
    ctx.translate(width, 0);

    return positions;
});

common.writePNG(canvas, 'minimap/districts.png', 8);

fs.writeFileSync('app/src/js/data/positions.json', JSON.stringify(_.flatten(positionChunks)));
