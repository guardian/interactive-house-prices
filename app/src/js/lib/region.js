import reqwest from 'ded/reqwest';
import topojson from 'mbostock/topojson';

import { config } from './cfg';

export const startYear = 1995;
export const endYear = 2014;

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

export function getRegionPrices(region, year) {
    var [min, max, med, count, r0, r1, r2, r3, r4, r5, r6, r7, r8] = region.properties.prices[year - startYear];
    return {min, max, med, count, range: [r0, r1, r2, r3, r4, r5, r6, r7, r8]};
}

export function getCountryMedian(districts) {
    var data = [],
        medians = [], 
        wage = 25000,
        yearCount = districts[0].properties.prices.length, 
        distCount = districts.length;

    for(var i = 0; i < yearCount; i++){
        medians[i] = [];
    }

    // group district med by year
    districts.forEach((d, i) => {
        d.properties.prices.forEach((p, j) => {
            medians[j][i] = p[2];
        });
    });
    
    // calc med house price lower than med salary
    medians.forEach((meds, i) => { 
        var affordableCount = meds.filter(m => m <= wage*4).length;
        var nosalesCount = meds.filter(m => m === 0).length;
        var ratio = (affordableCount-nosalesCount) / (distCount-nosalesCount);
        data[i] = {
            x: i,
            y: Math.round(ratio*10000)/100
        }; 
    });
    
    return data;
}
