import { getRegionPrices } from '../lib/region';
import debounce from '../lib/debounce';
import Linechart from './linechart';

import template from './templates/tooltip.html!text';
import areaName from '../data/areas-name.json!json';

const tooltipWidth = 320;
const tooltipHeight = 200;

export default class Tooltip {
    constructor(root) {
        this.el = root.querySelector('.js-tooltip');
        this.el.innerHTML = template;
        
        // els for datai
        // header
        this.areaEl = this.el.querySelector('.js-area');
        this.districtEl = this.el.querySelector('.js-district');
        // body
        this.numEl = this.el.querySelector('.js-num'); //number of sales
        this.minEl = this.el.querySelector('.js-min');
        this.maxEl = this.el.querySelector('.js-max');
        this.medEls = Array.from(this.el.querySelectorAll('.js-med'));
        this.salaryEls = Array.from(this.el.querySelectorAll('.js-salary'));
        this.factorEls = Array.from(this.el.querySelectorAll('.js-factor'));
       
        // els for styles
        this.emptyEl = this.el.querySelector('.range-empty');
        this.rangeEl = this.el.querySelector('.range-pipes');
        this.markerSalaryEl = this.el.querySelector('.marker-salary');
        this.markerMedEl = this.el.querySelector('.marker-med');
        this.markerMinEl = this.el.querySelector('.marker-min');
        this.labelMinEl = this.el.querySelector('.label-min');
        this.labelFacMedEl = this.el.querySelector('.label-facmed');
        this.labelFacEl = this.el.querySelector('.label-fac');
        
        // init line chart
        this.linechart = new Linechart(".js-lines", 280, 15);
        

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
        
        var prices = getRegionPrices(districtObj, data.year),
            salary = data.threshold,
            factor = prices.med/salary;
        
        var empty = 0,
            ratio = 100/prices.max,
            ratioMin = ratio*prices.min,
            ratioMed = ratio*prices.med,
            ratioSalary = ratio*salary,
            range = ratioSalary*8;
        
        // change styles
        if (prices.count === 0) {
            ratioMin = 0;
            ratioMed = 50;
            empty = 100;
        } else if (prices.count ===1) {
            ratioMin = 98;
        }

        this.rangeEl.style.width = range + "%";        
        this.emptyEl.style.width = empty + "%";
        
        this.markerSalaryEl.style.left = ratioSalary + "%";        
        this.markerMedEl.style.left = ratioMed + "%";        
        this.markerMinEl.style.left = ratioMin + "%";        
        
        this.labelMinEl.style.marginLeft = ((ratioMin < 50) ? ratioMin : 50) + "%";   
        this.labelFacEl.style.fontSize = 8 + ((factor<24)?factor:24) + "px"; 

        if (ratioMed > 65) {
            this.labelFacMedEl.style.left = "auto";
            this.labelFacMedEl.style.right = 0;
        } else if (ratioMed > 35) {
            this.labelFacMedEl.style.left = (ratioMed-5) + "%";
            this.labelFacMedEl.style.right = "auto";
        } else {
            this.labelFacMedEl.style.left = "auto";
            this.labelFacMedEl.style.right = "auto";
        }
        
        // load data
        this.areaEl.textContent = area; 
        this.districtEl.textContent = district; 
        
        this.numEl.textContent = prices.count || 0;
        this.minEl.textContent = prices.min.toLocaleString();
        this.maxEl.textContent = prices.max.toLocaleString();
        
        this.medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        this.factorEls.forEach(el => el.textContent = Math.round(factor*10)/10);
        
        // update line chart
        var diff = (100 - ratioMin)/6; 
        console.log(prices.range);
        var lines = prices.range.map((l, i, arr) => {
            return {
                y: l,                            // count
                x: (ratioMin + diff*(i+0.5))*2.8 // range
            };
        });
        this.linechart.update(lines);

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
