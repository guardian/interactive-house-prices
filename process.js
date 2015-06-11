var fs = require('fs');
var util = require('util');
var zlib = require('zlib');
var _ = require('lodash');
var humanize = require('humanize');
var topojson = require('topojson');

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

var types = {
    'areas': function () { return 'areas'; },
    'districts': function (id) { return id.replace(/[0-9].*/, ''); }, // AA9A -> AA
    'sectors': function (id) { return id.replace(/[0-9].*/, ''); } // AA9A 9 -> AA
};

_.forEach(types, function (groupFn, type) {
    console.log('Processing ' + type);

    var geo = JSON.parse(fs.readFileSync('data/' + type + '.json'));
    var prices = readCSV('data/' + type + '.csv');

    // Reduce prices to a flat object of id to prices
    // e.g. {'AA': [12345, ...], ...}
    // TODO: add missing months
    var pricesById = _(prices)
        .groupBy('id')
        .mapValues(function (price) {
            return _.sortBy(price, function (row) { return row.year + row.month; })
                .map(function (row) { return Number(parseFloat(row.avg).toFixed(2)); });
        });

    // Group IDs ready for splitting into different files
    var groups = pricesById.pairs()
        .groupBy(function (price) { return groupFn(price[0]); })
        .mapValues(function (price) { return _.zipObject(price); });

    // Write the files
    var files = groups.mapValues(function (data, groupId) {
        var json = JSON.stringify(data);
        fs.writeFileSync(util.format('app/src/assets/%s/%s.json', type, groupId), json);
        return {'raw': json.length, 'gzip': zlib.gzipSync(json).length};
    });

    // Output the highest file sizes
    files.pairs()
        .sortBy(function (file) { return -file[1].gzip; })
        .value()
        .slice(0, 10)
        .forEach(function (file) {
            var log = util.format('  %s:\t%s (%s)', file[0], humanize.filesize(file[1].gzip),
                humanize.filesize(file[1].raw));
            console.log(log);
        });
});
