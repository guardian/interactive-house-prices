var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var Canvas = require('canvas');
var d3 = require('d3');
require("d3-geo-projection")(d3);

var IMG_WIDTH = 400;
var IMG_HEIGHT = 480;
var THRESHOLD = 25000 * 4;

var projection = d3.geo.mercator().scale(1).translate([0, 0]);
var path = d3.geo.path().projection(projection);

var b = path.bounds(common.geo),
    s = .95 / Math.max((b[1][0] - b[0][0]) / IMG_WIDTH, (b[1][1] - b[0][1]) / IMG_HEIGHT),
    t = [(IMG_WIDTH - s * (b[1][0] + b[0][0])) / 2, (IMG_HEIGHT - s * (b[1][1] + b[0][1])) / 2];

projection.scale(s);

function render(ctx, features, color) {
    var ctxPath = path.context(ctx);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    features.forEach(function (feature) {
        ctx.beginPath();
        ctxPath(feature);
        ctx.fill('evenodd');
        ctx.stroke();
    });
}

var canvas = new Canvas(IMG_WIDTH * common.dates.length, IMG_HEIGHT),
    ctx = canvas.getContext('2d'),
    stream = canvas.pngStream(),
    out = fs.createWriteStream('out.png');

canvas.pngStream().on('data', function (chunk) { out.write(chunk); });

ctx.fillStyle = '#66091c';
ctx.fillRect(0, 0, IMG_WIDTH * common.dates.length, IMG_HEIGHT);

common.dates.forEach(function (date, dateI) {
    projection.translate([t[0] + dateI * IMG_WIDTH, t[1]]);

    var features = common.geo.features;

    if (dateI > 0) {
        features = features.filter(function (feature) {
            return common.prices[feature.properties.name][dateI - 1][2] <= THRESHOLD;
        });
    }

    features = _.groupBy(features, function (feature) {
        return common.prices[feature.properties.name][dateI][2] > THRESHOLD ? 'going' : 'staying';
    });

    render(ctx, features.staying, '#CCCCCC');
    render(ctx, features.going, '#ed3d61');
});
