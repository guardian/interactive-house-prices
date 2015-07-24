import { periodMedians, getTooltipStats } from '../lib/region'
import debounce from '../lib/debounce'
import Linechart from './linechart'

import template from './templates/tooltip.html!text'
import areaName from '../data/areas-name.json!json'
import districtCodes from '../data/codes.json!json'

const tooltipWidth = 320;
const tooltipHeight = 200;

var setTranslate = (function () {
    var anim, translate;
    return function (el, x, y) {
        translate = `translate(${x}px, ${y}px)`;

        if (!anim) {
            anim = window.requestAnimationFrame(() => {
                el.style.transform = translate;
                el.style.msTransform = translate;
                el.style.webkitTransform = translate;
                anim = null;
            });
        }
    };
})();
function setTranslate(el, x, y) {
}

export default function Tooltip(root) {
    var el, areaEl, districtEl, numEl, upfEl, minEl, maxEl,
        medEls, salaryEls, factorEl, yearUserEl, yearAffordableEl, rangeEl;
    var upfPos, medPos;
    var linechart;
    var hidden = true, viewWidth, viewHeight;
    var tooltipStats;

    function getDistrictStats(district, year) {
        var stats = tooltipStats[year][districtCodes.indexOf(district)];
        var median = periodMedians[year][district];
        return stats && {
            'med': median,
            'count': stats[0],
            'min': stats[1] * 100,
            'upper_fence': stats[2] * 100,
            'max': stats[3] * 100,
            'histogram': stats.slice(4)
        };
    }

    function init(stats) {
        tooltipStats = stats;

        el = root.querySelector('.js-tooltip');
        el.innerHTML = template;

        // els for data
        // header
        areaEl = el.querySelector('.js-area');
        districtEl = el.querySelector('.js-district');
        // body
        numEl = el.querySelector('.js-num'); //number of sales
        upfEl = el.querySelector('.js-upf'); //upper fence
        minEl = el.querySelector('.js-min');
        maxEl = el.querySelector('.js-max');
        medEls = [].slice.call(el.querySelectorAll('.js-med'));
        salaryEls = [].slice.call(el.querySelectorAll('.js-salary'));
        factorEl = el.querySelector('.js-factor');
        yearUserEl = el.querySelector('.js-year-user');
        yearAffordableEl = el.querySelector('.js-year-affordable');

        // els for styles
        upfPos = el.querySelector('.pos-a-upf'); //upper fence
        medPos = el.querySelector('.pos-a-med');

        rangeEl = el.querySelector('.js-pipes');

        // init line chart
        linechart = new Linechart("js-lines", "line-mask", 280, 64, 10, 5, true);

        var resize = debounce(function () {
            viewWidth = root.clientWidth;
            viewHeight = root.clientHeight;
        }.bind(this), 200);

        window.addEventListener('resize', () => {
            if (!hidden) hide();
            resize();
        });

        resize();
    }

    this.show = function (evt, userInput) {
        // return if json is not yet loaded
        if (!tooltipStats) { return; }

        var districtObj = evt.target.feature,
            district = districtObj.id,
            area = areaName[district.replace(/[0-9].*/,'')] + " area";

        var prices = getDistrictStats(district, userInput.year);
        
        // return and hide if data doesn't exist
        if (prices===null) { hidden = true; return; }

        var salary = userInput.threshold,
            factor = prices.med/salary,
            ratio = 100/prices.upper_fence, //TODO
            ratioMin = ratio*prices.min,
            ratioMed = ratio*prices.med,
            ratioSalary = ratio*salary,
            range = ratioSalary*8;

        var count = prices.count;

        var numBins = prices.histogram.length, // number of bins
            diff = 280/numBins,
            rangeDiff = numBins!==0 ? 100/(numBins-1):0,
            rangeWidth  = (8*(100-rangeDiff)*salary/(prices.upper_fence-prices.min));

        upfPos.style.right = rangeDiff + "%";
        medPos.style.left  = ((prices.med-prices.min)*rangeWidth/(8*salary)) + "%";

        rangeEl.style.width = rangeWidth + "%";
        rangeEl.style.marginLeft = (-prices.min*rangeWidth/(8*salary)) + "%";

        factorEl.style.fontSize = 12 + ((factor<20)?factor:20) + "px";


        // load data
        areaEl.textContent = area;
        districtEl.textContent = district;

        numEl.textContent = prices.count;
        minEl.textContent = prices.min.toLocaleString();
        maxEl.textContent = prices.max.toLocaleString();
        upfEl.textContent = prices.upper_fence.toLocaleString();

        medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        factorEl.textContent = Math.round(factor*10)/10;

        var textAffordable = "";
        for (var yr=userInput.year; yr>=1995; yr--) {
            var median = periodMedians[yr][district];
            var rateAffordable = Math.round((median/userInput.threshold)*10)/10;
            if (yr===userInput.year && rateAffordable <=4 ) { break; }
            if (rateAffordable <= 4) {
                textAffordable = "You would have been able to afford it in " + yr + " when it was " + rateAffordable + ".";
                break;
            } else {
                textAffordable = "You would not have been able to afford it even back in 1995.";
            }
        }
        yearUserEl.textContent = userInput.year;
        yearAffordableEl.textContent = textAffordable;

        // update line chart
        var dataBins = prices.histogram.map((l, i, arr) => {
            return {
                x: diff*(i+0.5), // range
                y: l                   // count
            };
        });
        linechart.updateMask(dataBins, "line-mask", "monotone");
        linechart.updateAxis(dataBins);
        linechart.updateLabels(dataBins);

        hidden = false;
        this.move(evt);
    }

    this.hide = function () {
        hidden = true;
        setTranslate(el, -1000, -1000);
    }

    this.move = function (evt) {
        var x = evt.containerPoint.x;
        var y = evt.containerPoint.y;
        if (x + tooltipWidth > viewWidth) {
            x -= tooltipWidth;
        }
        if (y + tooltipHeight > viewHeight) {
            y -= tooltipHeight;
        }
        
        if (!hidden) { setTranslate(el, x, y); }
        else { setTranslate(el, -1000, -1000); } // hide tooltip if data doesn't exist
    }

    getTooltipStats(init);
}
