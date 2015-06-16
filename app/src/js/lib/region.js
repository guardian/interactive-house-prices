import reqwest from 'ded/reqwest'
import topojson from 'mbostock/topojson'

import { config } from './cfg'

var regions = {'areas': {}, 'districts': {}, 'sectors': {}};

export function getNewRegionId(id, newType) {
    switch (newType) {
        case 'areas': return 'areas';
        case 'districts': return id.length > 2 ? id.replace(/[0-9].*/, '') : id; // AA9A A -> AA or AA -> AA
        case 'sectors': return id.replace(/[0-9].*/, ''); // AA9A 9 -> AA
    }
}

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
    var [avg, min, max, med] = region.properties.prices[(year - startYear) * 12 + month];
    return {'avg': avg, 'min': min, 'max': max, 'med': med};
}
