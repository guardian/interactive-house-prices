import reqwest from 'ded/reqwest'
import topojson from 'mbostock/topojson'

import { config } from './cfg'

export function getDistricts() {
    return new Promise((resolve, reject) => {
        reqwest({
            url: config.assetPath + '/assets/districts/districts.json',
            type: 'html', // force JSON parsing to be done in worker
            crossOrigin: true,
            success: text => {
                if (window.Worker) {
                    var worker = new Worker(config.assetPath + '/districts.js');
                    worker.addEventListener('message', function (e) { resolve(e.data); } );
                    worker.postMessage(text);
                } else {
                    var topo = JSON.parse(text);
                    resolve(topojson.feature(topo, topo.objects.shapes));
                }
            },
            error: err => {
                console.log('Could not load districts data');
                reject(err);
            }
        });
    });
}

const startYear = 2014;
export function getRegionPrices(region, year, month) {
    var [avg, min, max, med, count] = region.properties.prices[(year - startYear) * 12 + month];
    return {avg, min, max, med, count};
}
