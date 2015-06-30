import { getRegionPrices } from '../lib/region';
import debounce from '../lib/debounce';

import template from './templates/tooltip.html!text';
import areaName from '../data/areas-name.json!json';

const min = 7000;
const max = 50000000;

const tooltipWidth = 256;
const tooltipHeight = 200;

export default class Tooltip {
    constructor(root) {
        this.el = root.querySelector('.js-tooltip');
        this.el.innerHTML = template;

        this.areaEl = this.el.querySelector('.js-area');
        this.districtEl = this.el.querySelector('.js-district');
        
        this.factorEl = this.el.querySelector('.js-factor');
        this.salaryEls = Array.from(this.el.querySelectorAll('.js-salary'));
        this.medEls = Array.from(this.el.querySelectorAll('.js-med'));
        
        this.minEl = this.el.querySelector('.js-min');
        this.maxEl = this.el.querySelector('.js-max');
        this.avgEl = this.el.querySelector('.js-avg');
        
        this.range1El = this.el.querySelector('.range-pipe-l');
        this.range2El = this.el.querySelector('.range-pipe-s');
        this.range3El = this.el.querySelector('.range-pipe-r');
        
        this.marker1El = this.el.querySelector('.marker-salary');
        this.marker2El = this.el.querySelector('.marker-med');
        this.marker3El = this.el.querySelector('.marker-min');
        //this.markerEls = Array.from(this.el.querySelectorAll('.marker'));

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

        var districtObj = evt.target.feature,
            district = districtObj.id,
            area = areaName[district.replace(/[0-9].*/,'')] + " area";
        
        var prices = getRegionPrices(districtObj, data.year, data.month),
            salary = data.threshold,
            factor = prices.med / salary;

        var ratio = 100 / prices.max,
            range1 = ratio * salary * 4,
            range2 = ratio * salary * 14,
            range3 = 100 - range1 - range2;
        
        //console.log(district);
        //console.log(prices);
        
        // header
        this.areaEl.textContent = area; 
        this.districtEl.textContent = district; 
        
        // summary
        this.marker1El.style.left = ratio*salary + "%";        
        this.marker2El.style.left = ratio*prices.med + "%";        
        this.marker3El.style.left = ratio*prices.min + "%";        

        this.minEl.textContent = prices.min.toLocaleString();
        this.maxEl.textContent = prices.max.toLocaleString();
      //this.avgEl.textContent = prices.avg.toLocaleString();
        this.factorEl.textContent = factor.toLocaleString();
        
        this.medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        
        this.range1El.style.width = range1 + "%";        
        this.range2El.style.width = range2 + "%";        
        //this.range3El.style.width = range3 + "%";        
        
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
