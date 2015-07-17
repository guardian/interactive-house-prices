var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var Canvas = require('canvas');
var d3 = require('d3');
require("d3-geo-projection")(d3);

var IMG_WIDTH = 315;
var IMG_HEIGHT = 378;
var THRESHOLD = 25000 * 4 / 100;

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

function isAffordable(feature, yearI) {
    var stats = common.prices[feature.properties.name].stats;
    return stats && stats[2] <= THRESHOLD;
}

var canvas = new Canvas(IMG_WIDTH * common.years.length, IMG_HEIGHT),
    ctx = canvas.getContext('2d');

ctx.fillStyle = '#a60947';
ctx.fillRect(0, 0, IMG_WIDTH * common.years.length, IMG_HEIGHT);

common.years.forEach(function (year, yearI) {
    projection.translate([t[0] + yearI * IMG_WIDTH, t[1]]);

    var features = common.geo.features;

    if (yearI > 0) {
        features = features.filter(function (feature) {
            return isAffordable(feature, yearI - 1);
        });
    }

    features = _.groupBy(features, function (feature) {
        return isAffordable(feature, yearI) ? 'staying' : 'going';
    });

    render(ctx, features.staying, '#e0e0e0');
    render(ctx, features.going, '#ca2354');
});

common.writePNG(canvas, 'intro.png', 8);
