var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var Canvas = require('canvas');
var d3 = require('d3');
require('d3-geo-projection')(d3);

var IMG_WIDTH = 100;
var IMG_HEIGHT = 120;

var canvas = new Canvas(IMG_WIDTH, IMG_HEIGHT),
    ctx = canvas.getContext('2d');

var projection = d3.geo.mercator().scale(1).translate([0, 0]);
var path = d3.geo.path().projection(projection).context(ctx);

var b = path.bounds(common.districtGeo),
    s = .95 / Math.max((b[1][0] - b[0][0]) / IMG_WIDTH, (b[1][1] - b[0][1]) / IMG_HEIGHT),
    t = [(IMG_WIDTH - s * (b[1][0] + b[0][0])) / 2, (IMG_HEIGHT - s * (b[1][1] + b[0][1])) / 2];

projection.scale(s).translate(t);

ctx.fillStyle = ctx.strokeStyle = '#e0e0e0';
path(common.districtGeo);
ctx.fill('evenodd');
ctx.stroke();
common.writePNG(canvas, 'minimap/bg.png', 4);

var features = _.indexBy(common.districtGeo.features, 'properties.name');

ctx.fillStyle = ctx.strokeStyle = '#ed3d61';
_.forEach(common.periodStats, function (yearStats, year) {
    console.log(year);

    var sortedDistricts = yearStats
        .filter(function (stat) { return stat; })
        .sort(function (a, b) { return b.median - a.median; })
        .map(function (stat) { return stat.district; });

    ctx.clearRect(0, 0, IMG_WIDTH, IMG_HEIGHT);
    sortedDistricts.forEach(function (district, i) {
        process.stdout.write('.');
        ctx.beginPath();
        path(features[district]);
        ctx.fill('evenodd');
        ctx.stroke();

        common.writePNG(canvas, 'minimap/' + year + '-' + i + '.png', 4);
    });
    process.stdout.write('\n');
});

