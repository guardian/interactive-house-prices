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
        
        // els for data
        // header
        this.areaEl = this.el.querySelector('.js-area');
        this.districtEl = this.el.querySelector('.js-district');
        // body
        this.numEl = this.el.querySelector('.js-num'); //number of sales
        this.upfEl = this.el.querySelector('.js-upf'); //upper fence
        this.minEl = this.el.querySelector('.js-min');
        this.maxEl = this.el.querySelector('.js-max');
        this.medEls = Array.from(this.el.querySelectorAll('.js-med'));
        this.salaryEls = Array.from(this.el.querySelectorAll('.js-salary'));
        this.factorEl = this.el.querySelector('.js-factor');
        this.yearUserEl = this.el.querySelector('.js-year-user');
        this.yearAffordableEl = this.el.querySelector('.js-year-affordable');
       
        // els for styles
        this.upfPos = this.el.querySelector('.pos-a-upf'); //upper fence
        this.medPos = this.el.querySelector('.pos-a-med');
        
        this.rangeEl = this.el.querySelector('.js-pipes');
        
        // init line chart
        this.linechart = new Linechart("js-lines", "line-mask", 280, 64, 10, 5, true);
        

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
        
        var ratio = 100/prices.upper_fence, //TODO
            ratioMin = ratio*prices.min,
            ratioMed = ratio*prices.med,
            ratioSalary = ratio*salary,
            range = ratioSalary*8;
       
        var count = prices.count;
        
        var numBins = prices.histogram.length, // number of bins 
            diff = 280/numBins,
            rangeDiff = numBins!==0 ? 100/(numBins-1):0,
            rangeWidth  = (8*(100-rangeDiff)*salary/(prices.upper_fence-prices.min)); 
        
        this.upfPos.style.right = rangeDiff + "%";  
        this.medPos.style.left  = ((prices.med-prices.min)*rangeWidth/(8*salary)) + "%";  
        
        this.rangeEl.style.width = rangeWidth + "%"; 
        this.rangeEl.style.marginLeft = (-prices.min*rangeWidth/(8*salary)) + "%";        
       
        this.factorEl.style.fontSize = 12 + ((factor<20)?factor:20) + "px"; 
        
        
        // load data
        this.areaEl.textContent = area; 
        this.districtEl.textContent = district; 
        
        this.numEl.textContent = prices.count;
        this.minEl.textContent = prices.min.toLocaleString();
        this.maxEl.textContent = prices.max.toLocaleString();
        this.upfEl.textContent = prices.upper_fence.toLocaleString();
        
        this.medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        this.salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        this.factorEl.textContent = Math.round(factor*10)/10;
        
        var textAffordable = "";
        for (var yr=data.year; yr>=1995; yr--) {
            var yearPrices = getRegionPrices(districtObj, yr); 
            var rateAffordable = Math.round((yearPrices.med/data.threshold)*10)/10;
            if (yr===data.year && rateAffordable <=4 ) { break; }
            if (rateAffordable <= 4) {
                textAffordable = "You would have been able to afford it in " + yr + " when it was " + rateAffordable + "."; 
                break;
            } else {
                textAffordable = "You would not have been able to afford it even back in 1995.";
            }
        }
        this.yearUserEl.textContent = data.year;
        this.yearAffordableEl.textContent = textAffordable;

        // update line chart
        var dataBins = prices.histogram.map((l, i, arr) => {
            return {
                x: diff*(i+0.5), // range
                y: l                   // count
            };
        });
        this.linechart.updateMask(dataBins, "line-mask", "monotone");
        this.linechart.updateAxis(dataBins);
        this.linechart.updateLabels(dataBins);
        
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
        //setTranslate(this.el, 10, 10);
    }

    hide() {
        this.hidden = true;
        setTranslate(this.el, -1000, -1000);
    }
}
