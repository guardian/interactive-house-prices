var fs = require('fs');
var child_process = require('child_process');
var _ = require('lodash');

var COUNT_THRESHOLD = 10;

function readStats(file) {
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

function roundNo(nearest) {
    return function (n) {
        return Math.round(parseFloat(n)  / nearest);
    };
}

var districtGeo = JSON.parse(fs.readFileSync('data/districts.json'));
var districtStats = readStats('data/districts.csv');

var districtCodes = _(districtStats)
    .filter(function (stat) { return parseInt(stat.count) >= COUNT_THRESHOLD; })
    .map(function (sale) { return sale.postcode_district; })
    .uniq().value();

// {year: [{median, ...}, ...], ...}
var periodStats = _(districtStats)
    .groupBy(function (stat) { return stat.year_of_sale; })
    .mapValues(function (yearStats) {
        var districts = _(yearStats)
            .indexBy(function (stat) { return stat.postcode_district; })
            .mapValues(function (stat) {
                var limits = [stat.min, stat.max, stat.actual_max];
                var histogram = stat.histogram.replace(/\[0:\d+\]={/, '').replace('}', '')
                    .split(',').concat([stat.outliers]);

                return {
                    'median': roundNo(1)(stat.median),
                    'count': parseInt(stat.count),
                    'limits': limits.map(roundNo(100)),
                    'histogram': histogram.map(roundNo(1))
                }
            }).value();

        return districtCodes.map(function (code) {
            var district = districts[code];
            return district && district.count >= COUNT_THRESHOLD ? district : null;
        });
    }).value();


// Remove features with no stats
var districtFeatures = districtGeo.features.filter(function (district) {
    return districtCodes.indexOf(district.properties.name) !== -1;
});

module.exports = {
    'periodStats': periodStats,
    'districtCodes': districtCodes,
    'districtGeo': {'features': districtFeatures, 'type': 'FeatureCollection'},

    'writePNG': function (canvas, fn, ncolors) {
        fs.writeFileSync('out.png', canvas.toBuffer());
        child_process.execFileSync('pngquant', ['-f', '-o', 'app/src/assets/' + fn, ncolors, 'out.png']);
    }
};
