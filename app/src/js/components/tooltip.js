import areaName from '../data/areas-name.json!json'
import wageYear from '../data/wages.json!json'

const year = 0;
const month = 6;

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
    }

    show(evt) {
        var region = evt.target;
        var id = region.feature.id;

        var avg = region.feature.properties.prices[year * 12 + month];
        var min, max, med; min = max = med = avg;
        var fac = Math.round(med / wageYear[2014]); // TODO

        this.el.style.transform = `translate(${evt.originalEvent.screenX}px, ${evt.originalEvent.screenY}px)`;

        var salary = Math.round(wageYear[2014]),//[region],
            result = Math.round(salary*fac).toLocaleString(),
            range1 = Math.round(salary*6).toLocaleString(),
            range2 = Math.round(salary*12).toLocaleString();

        this.regionEl.textContent = `${areaName[id.replace(/[0-9].*/, '')]} area [${id}]`;
        this.resultEl.textContent = result;
        this.range1El.textContent = range1;
        this.range2El.textContent = range2;
        this.factorEl.textContent = fac.toLocaleString();
        this.minEl.textContent = min.toLocaleString();
        this.avgEl.textContent = avg.toLocaleString();
        this.maxEl.textContent = max.toLocaleString();
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
    }

    hide() {
        this.el.style.transform = 'translate(-1000px, -1000px)';
    }
}
