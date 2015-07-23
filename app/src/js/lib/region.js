import reqwest from 'ded/reqwest';
import topojson from 'mbostock/topojson';

import { config } from './cfg';

import medians from '../data/medians.json!json';
import districtCodes from '../data/codes.json!json';

export const startYear = 1995;
export const endYear = 2014;

export var periodMedians = {};

Object.keys(medians).forEach(function (year) {
    periodMedians[parseInt(year)] = {};
    districtCodes.forEach(function (code, i) {
        periodMedians[year][code] = medians[year][i];
    });
});

function processDistricts(onData, res) {
    var iframe = window.Worker && document.querySelector('.js-worker').contentWindow;

    if (iframe) {
        window.addEventListener('message', e => {
            if (e.source === iframe) {
                onData({
                    'districts': e.data,
                    'more': () => iframe.postMessage({'action': 'more'}, '*')
                })
            }
        });

        function send() {
            iframe.postMessage({'action': 'data', 'data': res}, 'http://localhost:8000');
        }

        if (iframe.document.readyState !== 'complete') {
            iframe.addEventListener('load', send);
        } else {
            send();
        }
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
        url: config.assetPath + '/assets/districts.json',
        type: 'html', // force JSON parsing to be done in worker
        crossOrigin: true,
        success: res => processDistricts(onData, res),
        error: err => console.log('Could not load districts data', err)
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

export function getCountryMedian(wage) {

}
