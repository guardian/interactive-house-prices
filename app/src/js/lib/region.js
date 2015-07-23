import reqwest from 'ded/reqwest';
import topojson from 'mbostock/topojson';

import { config } from './cfg';

import periodMediansRaw from '../data/medians.json!json';
import districtCodes from '../data/codes.json!json';

const districtsCount = districtCodes.length;

export var periodMedians = {};

Object.keys(periodMediansRaw).forEach(function (year) {
    periodMedians[parseInt(year)] = {};
    districtCodes.forEach(function (code, i) {
        periodMedians[year][code] = periodMediansRaw[year][i];
    });
});

const periodYears = Object.keys(periodMedians).map(n => parseInt(n)).sort((a, b) => a - b);
export const startYear = periodYears[0], endYear = periodYears[periodYears.length - 1];

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

export function getPeriodSplits(wage) {
    var threshold = wage * 4;
    var periodSplits = [];

    periodYears.map(year => {
        var unaffordable = 0, nosales = 0;
        periodMediansRaw[year].forEach(function (median) {
            if (!median) nosales++;
            else if (median > threshold) unaffordable++;
        });
        var ratio = unaffordable / (districtsCount - nosales) * 100;
        periodSplits[year] =  {ratio, unaffordable};
    });

    return periodSplits;
}
