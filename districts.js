var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var topojson = require('topojson');

fs.writeFileSync('app/src/js/data/codes.json', JSON.stringify(common.districtCodes));

var periodMedians = _.mapValues(common.periodStats, function (yearStats) {
    return yearStats.map(function(district) { return district && district.median; });
});
fs.writeFileSync('app/src/js/data/medians.json', JSON.stringify(periodMedians));

var allDistrictNames = JSON.parse(fs.readFileSync('data/district-names.json'));
var periodOtherStats = _.mapValues(common.periodStats, function (yearStats) {
    return yearStats.map(function (district) {
        return district && [district.count].concat(district.limits, district.histogram);
    });
});

var districtNames = _(allDistrictNames)
    .mapValues(function (districts) {
        return _.intersection(districts, common.districtCodes);
    })
    .pick(function (districts) { return districts.length > 0; })
    .value();

var tooltip = {'stats': periodOtherStats, 'names': districtNames};
fs.writeFileSync('app/src/assets/tooltip.json', JSON.stringify(tooltip));

// This is topojson's default presimplify function
function cartesianTriangleArea(triangle) {
    var a = triangle[0], b = triangle[1], c = triangle[2];
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
}

var topo = topojson.topology({'shapes': common.validDistrictGeo}, common.topoOptions);
topojson.simplify(topo, common.topoOptions);
topojson.filter(topo, common.topoOptions);
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
    } else {
        // This is the base zoom level
        zoom = 3;
    }

    return zoom + 3; // The base map zoom is 6
});

delete topo.bbox;

fs.writeFileSync('app/src/assets/districts.json', JSON.stringify(topo));
