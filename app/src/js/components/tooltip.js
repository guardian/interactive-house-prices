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
        
        // load from data
        this.areaEl = this.el.querySelector('.js-area');
        this.districtEl = this.el.querySelector('.js-district');
        
        this.numEl = this.el.querySelector('.js-num'); //number of sales
        this.minEl = this.el.querySelector('.js-min');
        this.maxEl = this.el.querySelector('.js-max');
        
        this.medEls = Array.from(this.el.querySelectorAll('.js-med'));
        this.salaryEls = Array.from(this.el.querySelectorAll('.js-salary'));
        this.factorEls = Array.from(this.el.querySelectorAll('.js-factor'));
       
        // add styles
        this.rangeEl = this.el.querySelector('.range-pipes');
        
        this.markerSalaryEl = this.el.querySelector('.marker-salary');
        this.markerMedEl = this.el.querySelector('.marker-med');
        this.markerMinEl = this.el.querySelector('.marker-min');
        this.labelMinEl = this.el.querySelector('.label-min');
        this.labelFacMedEl = this.el.querySelector('.label-facmed');
        this.labelFacEl = this.el.querySelector('.label-fac');

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
            range = ratio*salary*8,
            min = ratio*prices.min,
            med = ratio*prices.med;
        
        // change styles
        this.rangeEl.style.width = range + "%";        
        
        this.markerSalaryEl.style.left = ratio*salary + "%";        
        this.markerMedEl.style.left = med + "%";        
        this.markerMinEl.style.left = min + "%";        
        
        this.labelMinEl.style.marginLeft = ((min < 50) ? min : 50) + "%";   
        this.labelFacEl.style.fontSize = 8 + ((factor<24)?factor:24) + "px"; 

        if (med > 65) {
            this.labelFacMedEl.style.left = "auto";
            this.labelFacMedEl.style.right = 0;
        } else if (med > 35) {
            this.labelFacMedEl.style.left = (med-5) + "%";
            this.labelFacMedEl.style.right = "auto";
        } else {
            this.labelFacMedEl.style.left = "auto";
            this.labelFacMedEl.style.right = "auto";
        }
        
        
        // load from data
        this.areaEl.textContent = area; 
        this.districtEl.textContent = district; 
        
        this.numEl.textContent = prices.count || 0;
        this.minEl.textContent = prices.min.toLocaleString();
        this.maxEl.textContent = prices.max.toLocaleString();
        
        this.medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        this.factorEls.forEach(el => el.textContent = Math.round(factor*10)/10);
        
        
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
