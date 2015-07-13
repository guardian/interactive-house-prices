import { getRegionPrices } from '../lib/region';
import debounce from '../lib/debounce';
import Linechart from './linechart';

import template from './templates/tooltip.html!text';
import areaName from '../data/areas-name.json!json';

const tooltipWidth = 320;
const tooltipHeight = 200;

function setTranslate(el, x, y) {
    var translate = `translate(${x}px, ${y}px)`;
    el.style.transform = translate;
    el.style.msTransform = translate;
    el.style.webkitTransform = translate;
}

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
        // footer
        this.yearUserEl = this.el.querySelector('.js-year-user');
        this.yearAffordableEl = this.el.querySelector('.js-year-affordable');
       
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
        this.linechart = new Linechart(".js-lines", 280, 25);
        

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
            ratio = 100/prices.upper_fence, //TODO
            ratioMin = ratio*prices.min,
            ratioMed = ratio*prices.med,
            ratioSalary = ratio*salary,
            range = ratioSalary*8;
       
        var count = prices.range.reduce((pre, cur) => pre + cur) + prices.outlier; 
        // change styles
        if (count === 0) {
            ratioMin = 0;
            ratioMed = 50;
            empty = 100;
        } else if (count ===1) {
            ratioMin = 98;
        }

        this.rangeEl.style.width = range + "%";        
        this.emptyEl.style.width = empty + "%";
        
        this.markerSalaryEl.style.left = ratioSalary + "%";        
        this.markerMedEl.style.left = ratioMed + "%";        
        this.markerMinEl.style.left = ratioMin + "%";        
        
        this.labelMinEl.style.marginLeft = ((ratioMin < 50) ? ratioMin : 50) + "%";   
        this.labelFacEl.style.fontSize = 12 + ((factor<20)?factor:20) + "px"; 
        
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
        
        this.numEl.textContent = count || 0;
        this.minEl.textContent = prices.min.toLocaleString();
        this.maxEl.textContent = prices.upper_fence.toLocaleString();
        
        this.medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        this.factorEls.forEach(el => el.textContent = Math.round(factor*10)/10);
        
        var textAffordable = "";
        for (var yr=data.year; yr>=1995; yr--) {
            var yearPrices = getRegionPrices(districtObj, yr); 
            var rateAffordable = Math.round((yearPrices.med/data.threshold)*10)/10;
            if (yr===data.year && rateAffordable <=4 ) { break; }
            if (rateAffordable <= 4) {
                textAffordable = "You would have been able to afford it in " + 
                                 yr + " when it was " + rateAffordable + " (below 4)."; 
                break;
            } else {
                textAffordable = "You would not have been able to afford it even back in 1995.";
            }
        }
        this.yearUserEl.textContent = data.year;
        this.yearAffordableEl.textContent = textAffordable;

        // update line chart
        var diff = (100 - ratioMin)/6; 
        var lines = prices.range.map((l, i, arr) => {
            return {
                y: l,                            // count
                x: (ratioMin + diff*(i+0.5))*2.5 // range
            };
        });
        //lines.push({x:255, y:prices.near_outlier});
        lines.push({x:275, y:prices.outlier});
        this.linechart.update(lines);
        this.linechart.labels(lines);
        //console.log(prices.range);
        //console.log(lines);

        var x = evt.containerPoint.x;
        var y = evt.containerPoint.y;// - tooltipHeight;
        if (x + tooltipWidth > this.viewWidth) {
            x -= tooltipWidth;
        }
        if (y + tooltipHeight > this.viewHeight) {
            y -= tooltipHeight;
        }

        this.hidden = false;
        setTranslate(this.el, x, y);
    }

    hide() {
        this.hidden = true;
        setTranslate(this.el, -1000, -1000);
    }
}
