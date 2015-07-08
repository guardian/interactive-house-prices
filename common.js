var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');
require('moment-range');

var dates = [];
moment.range('2014-01-01', '2015-03-01').by('months', function (d) {
    dates.push(d.format('YYYYM'));
});

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

var geo = JSON.parse(fs.readFileSync('data/districts.json'));
var prices = readCSV('data/districts.csv');

// Reduce prices to a flat object of id to prices
// e.g. {'AA': [12345, ...], ...}
var pricesById = _(prices)
    .groupBy('id')
    .mapValues(function (price) {
        var p = _(price)
            .indexBy(function (row) { return row.year + row.month; })
            .mapValues(function (row) {
                return [row.min, row.max, row.median, row.count, row.r0, row.r1, row.r2, row.r3, row.r4,
                    row.r5, row.r6, row.r7, row.r8].map(function (n) { return parseInt(n); });
            }).value();
        return dates.map(function (date) {
            return p[date] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        });
    }).value();

// Remove any topologies that don't have associated prices
var features = geo.features.filter(function (feature) { return pricesById[feature.properties.name]; });

module.exports = {
    'dates': dates,
    'prices': pricesById,
    'geo': {'features': features, 'type': 'FeatureCollection'}
};
