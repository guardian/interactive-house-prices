import reqwest from 'ded/reqwest';
import topojson from 'mbostock/topojson';

import { config } from './cfg';

export const startYear = 1995;
export const endYear = 2014;

function processDistricts(onData, res) {
    var iframe = window.Worker && document.querySelector('.js-worker').contentWindow;

    if (iframe) {
        window.addEventListener('message', e => onData({
            'districts': e.data,
            'more': () => iframe.postMessage({'action': 'more'}, '*')
        }));
        iframe.postMessage({'action': 'data', 'data': res}, '*');
    } else {
        var topo = JSON.parse(res);
        onData({
            'districts': topojson.feature(topo, topo.objects.shapes),
            'more': () => onData({'districts': []})
        });
    }
}

export function getDistricts(onData) {
    reqwest({
        url: config.assetPath + '/assets/districts/districts.json',
        type: 'html', // force JSON parsing to be done in worker
        crossOrigin: true,
        success: res => processDistricts(onData, res),
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
