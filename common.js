var fs = require('fs');
var _ = require('lodash');
var topojson = require('topojson');
var d3 = require('d3');
require("d3-geo-projection")(d3);

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

function cartesianTriangleArea(triangle) {
    var a = triangle[0], b = triangle[1], c = triangle[2];
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
}

function geo2topo(features, retainProportion, propertyTransform) {
    var geo = {'shapes': {'features': features, 'type': 'FeatureCollection'}};
    var options = {
        'id': function (d) { return d.properties.name; },
        'coordinate-system': 'cartesian',
        'property-transform': propertyTransform,
        'pre-quantization': 1e8,
        'post-quantization': 1e4,
        'retain-proportion': retainProportion
    };

    // TODO: preproject?
    //geo.shapes = d3.geo.project(geo.shapes, d3.geo.mercator());

    var topo = topojson.topology(geo, options);
    topojson.simplify(topo, options);
    topojson.filter(topo, options);
    topojson.presimplify(topo, function (triangle) {
        var area = cartesianTriangleArea(triangle);

        // This might all look a bit arbitrary, thats because it pretty much is
        var zoom = 4;
        while ((1 / Math.pow(10, zoom)) > area && zoom <= 9) {
            zoom++;
        }

        // Basically don't allow zoom 5, because 4 and 5 are the same view (before the
        // buildup is overlaid) so it makes sense to keep them the same
        if (zoom > 4) {
            zoom += 1;
        }

        return zoom + 3; // The base map zoom is 7
    });

    delete topo.bbox;
    return topo;
}

var geo = JSON.parse(fs.readFileSync('data/districts.json'));
var prices = readCSV('data/districts.csv');

module.exports = {
    'geo': geo,
    'prices': prices,
    'geo2topo': geo2topo
}
