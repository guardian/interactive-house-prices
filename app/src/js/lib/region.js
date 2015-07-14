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
    var [min, max, med, upper_fence, r1, r2, r3, r4, r5, r6, outlier, count]  = region.properties.prices[year - startYear];
    return {
        min: min * 100,
        max: max * 100,
        med: med * 100,
        upper_fence: upper_fence * 100,
        range: [r1, r2, r3, r4, r5, r6],
        outlier,
        count
    };
}

export function getCountryMedian(districts, wage) {
    var data = [],
        medians = [], 
        yearCount = districts[0].properties.prices.length, 
        distCount = districts.length;

    for(var i = 0; i < yearCount; i++){
        medians[i] = [];
    }

    // group district med by year
    districts.forEach((d, i) => {
        d.properties.prices.forEach((p, j) => {
            medians[j][i] = p[2] * 100;
        });
    });
    //console.log(districts);    
    // calc med house price lower than med salary
    medians.forEach((meds, i) => { 
        var affordableCount = meds.filter(m => m > wage*4).length;
        var nosalesCount = meds.filter(m => m === 0).length;
        var ratio = (affordableCount-nosalesCount) / (distCount-nosalesCount);
        data[i] = {
            x: i,
            y: 100 - Math.round(ratio*10000)/100
        }; 
    });
    
    return data;
}
