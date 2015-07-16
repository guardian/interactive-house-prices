var fs = require('fs');
var _ = require('lodash');
var child_process = require('child_process');

var start = 1995;
var end = 2014;
var years = _.range(start, end + 1);

function readCSV(file) {
    var data = fs.readFileSync(file).toString();
    var rows = data.split('\n');
    var headers = rows.splice(0, 1)[0].split(',');
    return rows
        .filter(function (row) { return row.length; })
        .map(function(row) {
            var cols = row.split(',').map(function (col) { return col.trim(); });
            return _.object(headers, cols);
        });
}

function writePNG(canvas, fn, ncolors) {
    fs.writeFileSync('out.png', canvas.toBuffer());
    child_process.execFileSync('pngquant', ['-f', '-o', 'app/src/assets/' + fn, ncolors, 'out.png']);
}

var geo = JSON.parse(fs.readFileSync('data/districts.json'));
var prices = readCSV('data/districts.csv');

// Reduce prices to a flat object of id to prices
// e.g. {'AA': [12345, ...], ...}
var counts = {};
var pricesById = _(prices)
    .groupBy(function (p) { return p.id.trim(); })
    .mapValues(function (price, id) {
        var p = _(price)
            .indexBy(function (row) { return parseInt(row.year); })
            .mapValues(function (rowRaw) {
                var row = _.mapValues(rowRaw, function (n) { return Math.round(parseFloat(n)); });
                var a = [row.min, row.max, row.median, row.upper_fence].map(function (n) { return Math.round(n / 100); });
                var b = [row.r1, row.r2, row.r3, row.r4, row.r5, row.r6, row.near_outlier + row.far_outlier];
                var count = b.reduce(function (a, b) { return a + b; });
                return a.concat(b.map(function (c) { return Math.round(c / count * 20); }), [count]);
            }).value();
        return years.map(function (year) {
            if (p[year]) {
                if (p[year].slice(-1)[0] >= 10) {
                    return p[year];
                }
            } else {
                if (!counts[id]) counts[id] = [];
                counts[id].push(year);
            }
            return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        });
    }).value();

_.each(counts, function (v, k) {
    //console.log(k);
});

// Remove any topologies that don't have associated prices
var features = geo.features.filter(function (feature) { return pricesById[feature.properties.name]; });

module.exports = {
    'years': years,
    'prices': pricesById,
    'geo': {'features': features, 'type': 'FeatureCollection'},
    'writePNG': writePNG
};
