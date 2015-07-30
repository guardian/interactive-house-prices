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

// Based on Leaflet's projection/transformation functions
var project = (function () {
    var R = 6378137, d = Math.PI / 180, max = 1 - 1E-15;
    var a = 0.5 / (Math.PI * R);

    function _project(lat, lng) {
        var sin = Math.max(Math.min(Math.sin(lat * d), max), -max);
        return [R * lng * d, R * Math.log((1 + sin) / (1 - sin)) / 2];
    }

    function _transform(x, y) {
        return [a * x + 0.5, -a * y + 0.5];
    }

    function _scale(zoom) {
        return 256 * Math.pow(2, zoom);
    }

    return function(lat, lng) {
        var p = _project(lat, lng);
        return _transform(p[0], p[1]).map(function (n) { return n * _scale(0); });
    };
})();

function projectPolygon(rings) {
    rings.forEach(function (ring) {
        ring.forEach(function (point, i) {
            ring[i] = project(point[1], point[0]);
        });
    });
}

common.validDistrictGeo.features.forEach(function (feature) {
    if (feature.geometry.type === 'Polygon') { 
        projectPolygon(feature.geometry.coordinates);
    } else {
        feature.geometry.coordinates.forEach(projectPolygon);
    }
});

// This is topojson's default presimplify function
function cartesianTriangleArea(triangle) {
    var a = triangle[0], b = triangle[1], c = triangle[2];
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));
}

var topo = topojson.topology({'shapes': common.validDistrictGeo}, common.topoOptions);
topojson.simplify(topo, common.topoOptions);
topojson.filter(topo, common.topoOptions);

delete topo.bbox;

fs.writeFileSync('app/src/assets/districts.json', JSON.stringify(topo));
