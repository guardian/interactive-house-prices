var common = require('./common');
var fs = require('fs');
var zlib = require('zlib');
var _ = require('lodash');
var humanize = require('humanize');
var moment = require('moment');
require('moment-range');

var dates = [];
moment.range('2014-01-01', '2015-03-01').by('months', function (d) {
    dates.push(d);
});

console.log('Processing districts');

// Reduce prices to a flat object of id to prices
// e.g. {'AA': [12345, ...], ...}
var pricesById = _(common.prices)
    .groupBy('id')
    .mapValues(function (price) {
        var prices = _(price)
            .indexBy(function (row) { return row.year + row.month; })
            .mapValues(function (row) {
                return [row.min, row.max, row.median, row.count, row.r0, row.r1, row.r2, row.r3, row.r4,
                    row.r5, row.r6, row.r7, row.r8].map(function (n) { return parseInt(n); });
            }).value();
        return dates.map(function (date) {
            return prices[date.format('YYYYM')] || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        });
    }).value();

// Remove any topologies that don't have associated prices
var features = _.filter(common.geo.features, function (feature) { return pricesById[feature.properties.name]; });

var topo = common.geo2topo(features, 0.4, function (d) { return { 'prices': pricesById[d.properties.name] }; });
var json = JSON.stringify(topo);
fs.writeFileSync('app/src/assets/districts/districts.json', json);

console.log(humanize.filesize(zlib.gzipSync(json).length) + ' (' + humanize.filesize(json.length) + ')');
