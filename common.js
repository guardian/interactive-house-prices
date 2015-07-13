var fs = require('fs');
var _ = require('lodash');

var start = 1995;
var end = 2014;
var dates = _.range(start, end + 1);

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
//var counts = {};
var pricesById = _(prices)
    .groupBy(function (p) { return p.id.trim(); })
    .mapValues(function (price, id) {
        var p = _(price)
            .indexBy(function (row) { return row.year; })
            .mapValues(function (row) {
                return [row.min, row.max, row.median, row.upper_fence,
                    row.r1, row.r2, row.r3, row.r4, row.r5, row.r6,
                    row.near_outlier, row.far_outlier].map(function (n) { return parseInt(n); });
            }).value();
        return dates.map(function (date) {
            //if (!p[date+'']) { if (!counts[id]) counts[id] = 0; counts[id]++; console.log(id, date);}
            return p[date+''] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        });
    }).value();

//console.log(counts);

// Remove any topologies that don't have associated prices
var features = geo.features.filter(function (feature) { return pricesById[feature.properties.name]; });

module.exports = {
    'dates': dates,
    'prices': pricesById,
    'geo': {'features': features, 'type': 'FeatureCollection'}
};
