var common = require('./common');
var fs = require('fs');
var zlib = require('zlib');
var humanize = require('humanize');
var topojson = require('topojson');

// This is topojson's default presimplify function
function cartesianTriangleArea(triangle) {
    var a = triangle[0], b = triangle[1], c = triangle[2];
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
}

var options = {
    'id': function (d) { return d.properties.name; },
    'coordinate-system': 'cartesian',
    'property-transform': function (d) { return {'prices': common.prices[d.properties.name] }; },
    'pre-quantization': 1e8,
    'post-quantization': 1e4,
    'retain-proportion': 0.3
};

var topo = topojson.topology({'shapes': common.geo}, options);
topojson.simplify(topo, options);

// Create country outline for mapbox
var country = topojson.merge(topo, topo.objects.shapes.geometries);
fs.writeFileSync('data/country-geo.json', JSON.stringify(country));

// Create client file
// This might all look a bit arbitrary, thats because it pretty much is
topojson.filter(topo, options);
topojson.presimplify(topo, function (triangle) {
    var area = cartesianTriangleArea(triangle);

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

var json = JSON.stringify(topo);
fs.writeFileSync('app/src/assets/districts/districts.json', json);

console.log(humanize.filesize(zlib.gzipSync(json).length) + ' (' + humanize.filesize(json.length) + ')');
