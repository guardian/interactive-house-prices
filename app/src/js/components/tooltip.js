import { getRegionPrices } from '../lib/region'
import debounce from '../lib/debounce'

import areaName from '../data/areas-name.json!json'
import wageYear from '../data/wages.json!json'

const min = 7000;
const max = 50000000;

const tooltipWidth = 256;
const tooltipHeight = 128;

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

        var resize = debounce(function () {
            window.requestAnimationFrame(() => {
                this.viewWidth = window.innerWidth;
                this.viewHeight = window.innerHeight;
            });
        }.bind(this), 200);

        window.addEventListener('resize', () => {
            if (!this.hidden) this.hide();
            resize();
        });

        resize();
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

        var x = evt.originalEvent.screenX;
        var y = evt.originalEvent.screenY - tooltipHeight;
        if (x + tooltipWidth > this.viewWidth) {
            x -= tooltipWidth;
        }
        if (y + tooltipHeight > this.viewHeight) {
            y -= tooltipHeight;
        }

        this.hidden = false;
        this.el.style.transform = `translate(${x}px, ${y}px)`;
    }

    hide() {
        this.hidden = true;
        this.el.style.transform = 'translate(-1000px, -1000px)';
    }
}
