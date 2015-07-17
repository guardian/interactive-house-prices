import reqwest from 'ded/reqwest';
import topojson from 'mbostock/topojson';

import { config } from './cfg';

export const startYear = 1995;
export const endYear = 2014;

export function getDistricts(data) {
    var worker;
    if (window.Worker) {
        worker = new Worker(config.assetPath + '/districts.js');
    }

    reqwest({
        url: config.assetPath + '/assets/districts/districts.json',
        type: 'html', // force JSON parsing to be done in worker
        crossOrigin: true,
        success: text => {
            if (worker) {
                worker.addEventListener('message', e => data({
                    'districts': e.data,
                    'more': () => worker.postMessage({'action': 'more'})
                }));
                worker.postMessage({'action': 'data', 'data': text});
            } else {
                var topo = JSON.parse(text);
                data({
                    'districts': topojson.feature(topo, topo.objects.shapes),
                    'more': () => data({'districts': []})
                });
            }
        },
        error: err => {
            console.log('Could not load districts data');
            reject(err);
        }
    });
}

export function getRegionPrices(region, year) {
    var price = region.properties.prices[year - startYear];
    if (price.length > 0) {
        var [min, max, med, upper_fence, count, ...histogram] = price;
        return {
            min: min * 100,
            max: max * 100,
            med: med * 100,
            upper_fence: upper_fence * 100,
            count,
            histogram
        }
    }
    return {'min': 0, 'max': 0, 'med': 0, 'upper_fence': 0, 'count': 0, 'histogram': []};
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

    // calc med house price lower than med salary
    medians.forEach((meds, i) => { 
        var unaffordableCount = meds.filter(m => m > wage*4).length;
        var nosalesCount = meds.filter(m => m === 0).length;
        var ratio = (unaffordableCount - nosalesCount) / (distCount - nosalesCount);
        data[i] = {
            x: i,
            y: Math.round(ratio*10000)/100,
            no: unaffordableCount
        }; 
    });
    
    return data;
}
