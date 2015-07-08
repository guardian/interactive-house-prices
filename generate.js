var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var Canvas = require('canvas');
var GIFEncoder = require('gifencoder');
var d3 = require('d3');
require("d3-geo-projection")(d3);

var IMG_WIDTH = 400;
var IMG_HEIGHT = 500;
var IMG_COUNT = 4;
var THRESHOLD = 25000 * 4;

var projection = d3.geo.mercator().scale(1).translate([0, 0]);
var path = d3.geo.path().projection(projection);

var b = path.bounds(common.geo),
    s = .95 / Math.max((b[1][0] - b[0][0]) / IMG_WIDTH, (b[1][1] - b[0][1]) / IMG_HEIGHT),
    t = [(IMG_WIDTH - s * (b[1][0] + b[0][0])) / 2, (IMG_HEIGHT - s * (b[1][1] + b[0][1])) / 2];

projection.scale(s).translate(t);

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

var dateI = 0;
_.chunk(common.dates, Math.ceil(common.dates.length / IMG_COUNT)).forEach(function (dates, imgNo) {
    console.log('Generating ' + imgNo);

    var encoder = new GIFEncoder(IMG_WIDTH, IMG_HEIGHT);
    encoder.createReadStream().pipe(fs.createWriteStream('test' + imgNo + '.gif'));

    encoder.start();
    encoder.setDelay(500);

    var canvas = new Canvas(IMG_WIDTH, IMG_HEIGHT),
        ctx = canvas.getContext('2d');

    dates.forEach(function (date) {
        ctx.fillStyle = '#66091c';
        ctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGHT);

        var features = _.groupBy(common.geo.features, function (feature) {
            if (dateI > 0 && common.prices[feature.properties.name][dateI - 1][2] > THRESHOLD) {
                return 'gone';
            }
            return common.prices[feature.properties.name][dateI][2] > THRESHOLD ? 'going' : 'staying';
        });

        render(ctx, features.staying, '#CCCCCC');
        render(ctx, features.going, '#ed3d61');

        encoder.addFrame(ctx);
        dateI++;
    });

    encoder.finish();
});
