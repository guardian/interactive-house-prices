import reqwest from 'ded/reqwest'
import topojson from 'mbostock/topojson'

import { config } from './cfg'

var regions = {'areas': {}, 'districts': {}, 'sectors': {}};

export function getRegion(type, id) {
    return new Promise((resolve, reject) => {
        if (regions[type][id]) {
            resolve(regions[type][id]);
        } else {
            reqwest({
                url: `${config.assetPath}/assets/${type}/${id}.json`,
                type: 'json',
                crossOrigin: true,
                success: topo => {
                    regions[type][id] = topojson.feature(topo, topo.objects.shapes);
                    resolve(regions[type][id]);
                },
                error: err => {
                    console.log(`Could not load data for ${type}/${id}`);
                    reject(err);
                }
            });
        }
    });
}

const startYear = 2014;
export function getRegionPrices(region, year, month) {
    var [avg, min, max, med, count] = region.properties.prices[(year - startYear) * 12 + month];
    return {avg, min, max, med, count};
}
