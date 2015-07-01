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
        
        this.salaryEls = Array.from(this.el.querySelectorAll('.js-salary'));
        this.factorEls = Array.from(this.el.querySelectorAll('.js-factor'));
        this.medEls = Array.from(this.el.querySelectorAll('.js-med'));
        
        this.numEl = this.el.querySelector('.js-num');
        this.minEl = this.el.querySelector('.js-min');
        this.maxEl = this.el.querySelector('.js-max');
        this.avgEl = this.el.querySelector('.js-avg');
        
        //this.range1El = this.el.querySelector('.range-pipe-l'); //blue
        this.range2El = this.el.querySelector('.range-pipe-s'); //pipes
        
        this.marker1El = this.el.querySelector('.marker-salary');
        this.marker2El = this.el.querySelector('.marker-med');
        this.marker3El = this.el.querySelector('.marker-min');
        
        this.labelMinEl = this.el.querySelector('.label-min');
        this.labelMedEl = this.el.querySelector('.label-med');

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
            factor = prices.med/salary;
        
        var ratio = 100/prices.max,
            range1 = ratio*salary*4,
            range2 = ratio*salary*16,
            min = ratio*prices.min,
            med = ratio*prices.med;
        
        //console.log(district);
        //console.log(prices);
        
        // header
        this.areaEl.textContent = area; 
        this.districtEl.textContent = district; 
        
        // summary
        this.marker1El.style.left = ratio*salary + "%";        
        this.marker2El.style.left = med + "%";        
        this.marker2El.style.borderLeftWidth = Math.round(factor) + "px";        
        this.marker3El.style.left = min + "%";        
        
        if (med > 65) {
            this.labelMedEl.style.left = "auto";
            this.labelMedEl.style.right = 0;
        } else if (med > 35) {
            this.labelMedEl.style.left = (med-8) + "%";
            this.labelMedEl.style.right = "auto";
        } else {
            this.labelMedEl.style.left = "auto";
            this.labelMedEl.style.right = "auto";
        }
        
        this.labelMinEl.style.marginLeft = ((min < 50) ? min : 50) + "%";   
        console.log(prices.count);
        this.numEl.textContent = prices.count || 0;
        this.minEl.textContent = prices.min.toLocaleString();
        this.maxEl.textContent = prices.max.toLocaleString();
        
        this.medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        this.factorEls.forEach(el => el.textContent = Math.round(factor*100)/100);
        
        //this.range1El.style.width = range1 + "%";        
        this.range2El.style.width = range2 + "%";        
        
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
