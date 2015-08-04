var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var GIFEncoder = require('gifencoder');
var Canvas = require('canvas');
var d3 = require('d3');
require('d3-geo-projection')(d3);

var colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

var f_header = 'DE5 Display Egyptian SemiBold';
var f_headline = 'DE3 Display Egyptian';
var f_bodyHeading = 'TE4 Text Egyptian Medium';
var f_bodyCopy = 'TE32 Text Egyptian';
var f_textSans = 'TS3 Text Sans';

var CARD_WIDTH = 650;
var CARD_HEIGHT = 320;
var CARD_GUTTER = 20;

var MAP_HEIGHT = CARD_HEIGHT - CARD_GUTTER * 2;
var MAP_WIDTH = MAP_HEIGHT * 0.83;
var MAP_POSITION = [CARD_WIDTH - MAP_WIDTH - CARD_GUTTER, CARD_GUTTER];

var threshold = parseFloat(process.argv[2]);
if (!threshold) {
    console.error('No salary provided');
    process.exit(1);
}
var profession = process.argv[3];

var text = 'If you earn #ed3d61|£' + threshold.toLocaleString('en');
if (profession) {
    text += ' , the average salary for a ' + profession;
}
text += ' , where could you afford to buy';

// Create country outline
// These districts have no data but should be in the country outline
// so there aren't holes
var countryCodes = common.districtCodes.concat(['CA19', 'E20', 'LL39', 'LL66', 'LL69', 'LL70', 'LL73',
    'LL76', 'LL78', 'M17', 'M90', 'NG90', 'PE35', 'TR22', 'TR23', 'TR24', 'TR25', 'TW6']);

var countryFeatures = common.allDistrictGeo.features.filter(function (district) {
    return countryCodes.indexOf(district.properties.name) !== -1;
});
var countryGeo = {'features': countryFeatures, 'type': 'FeatureCollection'};

var canvas = new Canvas(CARD_WIDTH, CARD_HEIGHT),
    ctx = canvas.getContext('2d'),
    gif = new GIFEncoder(CARD_WIDTH, CARD_HEIGHT);

gif.createReadStream().pipe(process.stdout);
gif.setRepeat(0);
gif.setDelay(400);
gif.setQuality(1);

var projection = d3.geo.mercator().scale(1).translate([0, 0]);
var path = d3.geo.path().projection(projection).context(ctx);

var b = path.bounds(countryGeo),
    s = 1 / Math.max((b[1][0] - b[0][0]) / MAP_WIDTH, (b[1][1] - b[0][1]) / MAP_HEIGHT),
    t = [(MAP_WIDTH - s * (b[1][0] + b[0][0])) / 2, (MAP_HEIGHT - s * (b[1][1] + b[0][1])) / 2];

projection.scale(s).translate([t[0] + MAP_POSITION[0], t[1] + MAP_POSITION[1]]);

var districtFeatures = _.indexBy(countryFeatures, 'properties.name');

function drawText(size, font, originalX, y, text) {
    var words = text.split(' '), i, word, x = originalX;
    var maxX = MAP_POSITION[0] - CARD_GUTTER, lineHeight = size * 1.25;

    ctx.font = 'normal ' + size + 'px "' + font + '"';
    
    words.forEach(function (word, i) {
        var parts = word.split('|');
        if (parts.length > 1) {
            ctx.fillStyle = parts[0];
            word = parts[1];
        } else {
            ctx.fillStyle = '#333';
        }

        var metrics = ctx.measureText(word + ([',' , '?'].indexOf(words[i+1]) !== -1 ? '' : ' '));
        if (x + metrics.width > maxX && i > 0) {
            x = originalX;
            y += lineHeight;
        }
        ctx.fillText(word, x, y);
        x += metrics.width;
    });
}

gif.start();

_.forEach(common.periodStats, function (yearStats, year) {
    process.stderr.write(year + '\n');

    //if (year > 1995) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    drawText(35, f_bodyHeading, CARD_GUTTER, 100, '#UnaffordableCountry');
    drawText(27, f_bodyCopy, CARD_GUTTER, 140, text + ' in #ed3d61|' + year + ' ?');

    ctx.strokeStyle = ctx.fillStyle = '#e0e0e0';
    path(countryGeo);
    ctx.fill('evenodd');
    ctx.stroke();

    yearStats
        .filter(function (stat) { return stat; })
        .forEach(function (stat) {
            var index = Math.floor(stat.median / threshold) - 1;
            ctx.strokeStyle = ctx.fillStyle = colors[Math.max(0, Math.min(5, index))];
            ctx.beginPath();
            path(districtFeatures[stat.district]);
            ctx.fill('evenodd');
            ctx.stroke();
        });

    gif.addFrame(ctx);
});

gif.finish();
