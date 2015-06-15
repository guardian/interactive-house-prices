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

function geo2topo(features, simplify, propertyTransform) {
    var geo = {'shapes': {'features': features, 'type': 'FeatureCollection'}};
    var options = {
        'coordinate-system': 'cartesian',
        'id': function (d) { return d.properties.name; },
        'property-transform': propertyTransform,
        'pre-quantization': 1e8,
        'post-quantization': 1e4,
        'retain-proportion': simplify
    };
    var topo = topojson.topology(geo, options);
    topojson.simplify(topo, options);
    topojson.filter(topo, options);
    return topo;
};

var types = [
    {
        'name': 'areas',
        'groupFn': function () { return 'areas'; },
        'simplify': 0.1
    },
    {
        'name': 'districts',
        'groupFn': function (id) { return id.replace(/[0-9].*/, ''); }, // AA9A -> AA
        'simplify': 0.5
    },
    {
        'name': 'sectors',
        'groupFn': function (id) { return id.replace(/[0-9].*/, ''); }, // AA9A 9 -> AA
        'simplify': 0.5
    }
].filter(function (type) { return process.argv.length === 2 || process.argv.indexOf(type.name) !== -1 });

types.forEach(function (type) {
    console.log('Processing ' + type.name);

    var geo = JSON.parse(fs.readFileSync('data/' + type.name + '.json'));
    var prices = readCSV('data/' + type.name + '.csv');

    // Reduce prices to a flat object of id to prices
    // e.g. {'AA': [12345, ...], ...}
    // TODO: add missing months
    var pricesById = _(prices)
        .groupBy('id')
        .mapValues(function (price) {
            return _.sortBy(price, function (row) { return row.year + row.month; })
                .map(function (row) { return Number(parseFloat(row.avg).toFixed(2)); });
        })
        .value();

    // Remove any topologies that don't have associated prices
    var features = _.filter(geo.features, function (feature) { return pricesById[feature.properties.name]; });

    var topo = geo2topo(features, type.simplify, function (d) {
        return {
            'type': type.name,
            'prices': pricesById[d.properties.name]
        };
    });
    var arcs = _.cloneDeep(topo.arcs);

    // Split into groups of ids
    var groups = _(topo.objects.shapes.geometries)
        .groupBy(function (geo) { return type.groupFn(geo.id); })
        .mapValues(function (geos, id) {
            // Filter out arcs that aren't used by this group
            // NOTE: topojson modifies objects in place so reset the arcs each time
            topo.arcs = arcs;
            topo.objects.shapes.geometries = geos;
            topojson.filter(topo, {'coordinate-system': 'cartesian'});
            return _.cloneDeep(topo);
        });

    // Write the files
    var files = groups.mapValues(function (geo, groupId) {
        var json = JSON.stringify(geo);
        fs.writeFileSync(util.format('app/src/assets/%s/%s.json', type.name, groupId), json);
        return json;
    });

    // Output the highest file sizes
    files
        .mapValues(function (data) { return {'raw': data.length, 'gzip': zlib.gzipSync(data).length}; })
        .pairs()
        .sortBy(function (file) { return -file[1].gzip; })
        .value()
        .slice(0, 10)
        .forEach(function (file) {
            var log = util.format('  %s:\t%s (%s)', file[0], humanize.filesize(file[1].gzip),
                humanize.filesize(file[1].raw));
            console.log(log);
        });
});
