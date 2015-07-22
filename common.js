var fs = require('fs');
var _ = require('lodash');
var child_process = require('child_process');

var start = 1995;
var end = 2014;
var years = _.range(start, end + 1);

function readPrices(file) {
    var data = fs.readFileSync(file).toString();
    var rows = data.split('\n');
    var headers = rows.splice(0, 1)[0].split('|');
    return rows
        .filter(function (row) { return row.length; })
        .map(function(row) {
            var cols = row.split('|').map(function (col) { return col.trim(); });
            return _.object(headers, cols);
        });
}

function writePNG(canvas, fn, ncolors) {
    fs.writeFileSync('out.png', canvas.toBuffer());
    child_process.execFileSync('pngquant', ['-f', '-o', 'app/src/assets/' + fn, ncolors, 'out.png']);
}

var geo = JSON.parse(fs.readFileSync('data/districts.json'));
var prices = readPrices('data/districts.csv');

// Reduce prices to a flat object of district to prices
// e.g. {'AA': [12345, ...], ...}
var counts = {};
var pricesById = _(prices)
    .groupBy(function (p) { return p.postcode_district; })
    .mapValues(function (price, district) {
        var p = _(price)
            .indexBy(function (row) { return parseInt(row.year_of_sale); })
            .mapValues(function (row) {
                var median = Math.round(parseFloat(row.median));
                var stats = [row.min, row.actual_max, row.upper_fence].map(function (n) {
                    return Math.round(parseFloat(n) / 100);
                });
                var histogram = row.histogram.replace(/\[0:\d+\]={/, '').replace('}', '')
                    .split(',').concat([row.outliers]).map(function (n) {
                        return parseInt(n);
                    });
                return {
                    'median': median,
                    'stats': stats,
                    'histogram': histogram,
                    'count': parseInt(row.count)
                };
            }).value();
        return years.map(function (year) {
            if (p[year]) {
                if (p[year].count >= 10) {
                    return p[year];
                }
            } else {
                if (!counts[district]) counts[district] = [];
                counts[district].push(year);
            }
            return {};
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
