import { getRegionPrices } from '../lib/region'
import debounce from '../lib/debounce'

import template from './templates/tooltip.html!text'
import areaName from '../data/areas-name.json!json'

const min = 7000;
const max = 50000000;

const tooltipWidth = 256;
const tooltipHeight = 200;

export default class Tooltip {
    constructor(root) {
        this.el = root.querySelector('.js-tooltip');
        this.el.innerHTML = template;

        this.regionEl = this.el.querySelector('.js-region');
        this.resultEl = this.el.querySelector('.js-result');
        this.range1El = this.el.querySelector('.js-range1');
        this.range2El = this.el.querySelector('.js-range2');
        this.factorEl = this.el.querySelector('.js-factor');
        this.minEl = this.el.querySelector('.js-min');
        this.avgEl = this.el.querySelector('.js-avg');
        this.maxEl = this.el.querySelector('.js-max');
        this.salaryEls = Array.from(this.el.querySelectorAll('.js-salary'));

        var resize = debounce(function () {
            window.requestAnimationFrame(() => {
                this.viewWidth = root.clientWidth;
                this.viewHeight = root.clientHeight;
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

        var x = evt.containerPoint.x;
        var y = evt.containerPoint.y;// - tooltipHeight;
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
