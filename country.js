var common = require('./common');
var fs = require('fs');
var _ = require('lodash');
var topojson = require('topojson');

// Create country outline
// These districts have no data but should be in the country outline
// so there aren't holes
var countryCodes = common.districtCodes.concat(['CA19', 'E20', 'LL39', 'LL66', 'LL69', 'LL70', 'LL73',
    'LL76', 'LL78', 'M17', 'M90', 'NG90', 'PE35', 'TR22', 'TR23', 'TR24', 'TR25', 'TW6']);

var countryFeatures = common.allDistrictGeo.features.filter(function (district) {
    return countryCodes.indexOf(district.properties.name) !== -1;
});

var options = common.topoOptions;
var topo = topojson.topology({'shapes': {'features': countryFeatures, 'type': 'FeatureCollection'}}, options);
topojson.simplify(topo, options);
var country = topojson.merge(topo, topo.objects.shapes.geometries);
fs.writeFileSync('data/country.geojson', JSON.stringify(country));

