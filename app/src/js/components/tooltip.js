import { getRegionPrices } from '../lib/region'

import areaName from '../data/areas-name.json!json'
import wageYear from '../data/wages.json!json'

const min = 7000;
const max = 50000000;

export default class Tooltip {
    constructor(el) {
        this.el = el.querySelector('.js-tooltip');
        this.regionEl = el.querySelector('.js-region');
        this.resultEl = el.querySelector('.js-result');
        this.range1El = el.querySelector('.js-range1');
        this.range2El = el.querySelector('.js-range2');
        this.factorEl = el.querySelector('.js-factor');
        this.minEl = el.querySelector('.js-min');
        this.avgEl = el.querySelector('.js-avg');
        this.maxEl = el.querySelector('.js-max');
        this.salaryEls = Array.from(el.querySelectorAll('.js-salary'));

        this.hide();
    }

    show(evt, data) {
        var region = evt.target.feature;
        var prices = getRegionPrices(region, data.year, data.month);

        var salary = data.threshold;
        var fac = Math.round(prices.med / salary);

        var result = Math.round(salary*fac).toLocaleString(),
            range1 = Math.round(salary*6).toLocaleString(),
            range2 = Math.round(salary*12).toLocaleString();

        this.regionEl.textContent = `${areaName[region.id.replace(/[0-9].*/, '')]} area [${region.id}]`;
        this.resultEl.textContent = result;
        this.range1El.textContent = range1;
        this.range2El.textContent = range2;
        this.factorEl.textContent = fac.toLocaleString();
        this.minEl.textContent = prices.min.toLocaleString();
        this.avgEl.textContent = prices.avg.toLocaleString();
        this.maxEl.textContent = prices.max.toLocaleString();
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());

        this.el.style.transform = `translate(${evt.originalEvent.screenX}px, ${evt.originalEvent.screenY}px)`;
    }

    hide() {
        this.el.style.transform = 'translate(-1000px, -1000px)';
    }
}
