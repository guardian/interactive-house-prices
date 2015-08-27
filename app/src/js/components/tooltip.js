import { periodMedians, getTooltips } from '../lib/region';
import debounce from '../lib/debounce';
import translate from '../lib/translate';
import Linechart from './linechart';

import template from './templates/tooltip.html!text';
import districtCodes from '../data/codes.json!json';

const tooltipWidth = 300;
const tooltipHeight = 200;

const chartWidth = 280;
const chartHeight = 64;
const outlierWidth = 30;

export default function Tooltip(mapEl) {
    var areaEls, districtEl, numEls, upfEl, minEl, maxEl, medEls, salaryEls, 
        factorEls, yearUserEls, yearAffordableEl, pipeRangeEl, pipeOutlierEl, outlierEl;
    var translateEl;
    var factorFZ, upfPos, medPos;
    var viewWidth, viewHeight;
    var hidden = true;
    var tooltipNames, tooltipStats;
    var linechart;
    var curDistrict, curEvt;

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

    function init(names, stats) {
        tooltipNames = names;
        tooltipStats = stats;

        var el = mapEl.querySelector('.js-tooltip');
        el.innerHTML = template;
        translateEl = translate(el);

        // els for data
        // header
        districtEl = el.querySelector('.js-district');
        areaEls = [].slice.call(el.querySelectorAll('.js-area'));
        el.querySelector('.js-btn-clear').addEventListener('click', ()=> hide());
        
        // body
        upfEl = el.querySelector('.js-upf'); //upper fence
        minEl = el.querySelector('.js-min');
        maxEl = el.querySelector('.js-max');
        medEls = [].slice.call(el.querySelectorAll('.js-med'));
        salaryEls = [].slice.call(el.querySelectorAll('.js-salary'));
        
        numEls = [].slice.call(el.querySelectorAll('.js-num')); //number of sales
        yearUserEls = [].slice.call(el.querySelectorAll('.js-year-user'));
        yearAffordableEl = el.querySelector('.js-year-affordable');
        factorEls = [].slice.call(el.querySelectorAll('.js-factor'));

        // els for styles
        factorFZ = el.querySelector('.fz-factor');
        upfPos = el.querySelector('.pos-a-upf'); //upper fence
        medPos = el.querySelector('.pos-a-med');

        pipeRangeEl = el.querySelector('.js-range');
        pipeOutlierEl = el.querySelector('.js-outlier-pipe');
        outlierEl = el.querySelector('.js-outlier');

        // init line chart
        linechart = new Linechart("js-lines", "line-mask", chartWidth, chartHeight, 9, 5, true);

        var resize = debounce(function () {
            viewWidth = mapEl.clientWidth;
            viewHeight = mapEl.clientHeight;
        }.bind(this), 200);

        window.addEventListener('resize', () => {
            if (!hidden) hide();
            resize();
        });

        resize();
    }

    this.show = function (userInput, district, evt) {
        //TODO: debug!!!!!!
        district = district ? district:curDistrict;
        
        // return if json is not yet loaded
        if (!tooltipStats) { return; }
        if (!district) { return; }
        
        var prices = getDistrictStats(district, userInput.year);
        // return and hide if data doesn't exist
        if (prices===null) { hidden = true; return; }
        
        var salary = userInput.threshold,
            factor = prices.med/salary;

        var count = prices.count,               // number of sales
            numBins = prices.histogram.length;  // number of bins
        
        //hotfix: move outlier to the last bin if upf is max
        var hasOutlier = true,
            rangeWidth = 250;
        
        if (prices.upper_fence === prices.max) {
            prices.histogram[numBins-2]++;
            rangeWidth = chartWidth;
            hasOutlier = false;
        }
        
        var pipeEnd = salary*10,
            pipeRangeWidth = Math.round(pipeEnd*(rangeWidth-2)/(prices.upper_fence-prices.min)),
            pipeOutlierWidth = Math.round(pipeEnd*(outlierWidth-2)/(prices.max-prices.upper_fence));

        // color pipes
        pipeRangeEl.style.width = pipeRangeWidth + "px";
        pipeRangeEl.style.marginLeft = Math.round((-prices.min*pipeRangeWidth/pipeEnd)) + "px";
 
        // hotfix: move outlier to the last bin if upf is max
        if (prices.upper_fence === prices.max) {
            prices.histogram[numBins-2] += prices.histogram[numBins-1];
            rangeWidth = chartWidth;
            // TODO: check IE9!!!
            if (!upfPos.classList.contains("d-n")) {
                upfPos.classList.add("d-n");
                outlierEl.classList.add("d-n");
            }
        } else {
            if (upfPos.classList.contains("d-n")) {
                upfPos.classList.remove("d-n");
                outlierEl.classList.remove("d-n");
            }
        }

        pipeOutlierEl.style.width = pipeOutlierWidth + "px";
        pipeOutlierEl.style.marginLeft = Math.round((-prices.upper_fence*pipeOutlierWidth/pipeEnd)) + "px";
        
        upfPos.style.right = outlierWidth + "px";
        medPos.style.left  = ((prices.med-prices.min)*pipeRangeWidth/pipeEnd) + "px";
        
        factorFZ.style.fontSize = 12 + ((factor<20) ? factor/2 : 12) + "px";
        
        // load data
        districtEl.textContent = district;
        areaEls.forEach(el => el.textContent = tooltipNames[district]);

        minEl.textContent = prices.min.toLocaleString();
        maxEl.textContent = prices.max.toLocaleString();
        upfEl.textContent = prices.upper_fence.toLocaleString();

        medEls.forEach(el => el.textContent = prices.med.toLocaleString());
        numEls.forEach(el => el.textContent = prices.count);
        salaryEls.forEach(el => el.textContent = salary.toLocaleString());
        factorEls.forEach(el => el.textContent = Math.round(factor*10)/10);

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
        yearUserEls.forEach(el => el.textContent = userInput.year);
        yearAffordableEl.textContent = textAffordable;

        // update line chart
        var dataDiff = rangeWidth / (numBins-1),
            dataBins = prices.histogram.map((l, i, arr) => {
            //TODO: remove outlier if value is 0
            if (i===(numBins-1) && l===0) console.log(i, l);
            return {
                x: dataDiff*(i+0.5), //Range
                y: l                 //count
            };
        });
        linechart.updateMask(dataBins, "line-mask", "monotone", hasOutlier);
        linechart.updateAxis(dataBins.slice(0, -1), rangeWidth);
        linechart.updateText(dataBins);
        linechart.updateHeight(".chart-pin-upf", dataBins[numBins-1].y);

        hidden = false;
        this.move(evt);
    };

    var hide = this.hide = function () {
        hidden = true;
        translateEl(-1000, -1000);
    };

    this.move = function (evt) {
        var x = evt ? evt.containerPoint.x : 10;
        var y = evt ? evt.containerPoint.y : (document.querySelector(".js-map-controls").offsetTop) - 240;
        
        if (x + tooltipWidth > viewWidth) {
            x -= tooltipWidth;
        }
        if (y + tooltipHeight > viewHeight) {
            y -= tooltipHeight;
        }
        
        if (!hidden) { translateEl(x, y); }
        else { translateEl(-1000, -1000); } // hide tooltip if data doesn't exist
    };

    getTooltips(init);
}
