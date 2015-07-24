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
    if (window.Worker) {
        let iframe = document.createElement('iframe'), target;
        iframe.src = config.assetPath + '/worker.html';
        window.addEventListener('message', function (evt) {
            if (target) {
                if (evt.source === target) {
                    onData({
                        'districts': evt.data,
                        'more': () => target.postMessage({'action': 'more'}, '*')
                    });
                }
            } else {
                target = evt.source;
                target.postMessage({'action': 'data', 'data': res}, '*');
            }
        });
        document.body.appendChild(iframe);
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

export function getTooltipStats(onData) {
    reqwest({
        url: config.assetPath + '/assets/stats.json',
        type: 'json', // TODO: put in worker
        crossOrigin: true,
        success: res => onData(res),
        error: err => console.log('Could not load tooltip stats', err)
    });
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
