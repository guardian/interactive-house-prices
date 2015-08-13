import template from './templates/user.html!text';

import throttle from '../lib/throttle';
import { startYear, endYear, getPeriodSplits } from '../lib/region';
import { config } from '../lib/cfg';

import { stickyBar, setBottomNotSticky } from '../lib/sticky-bar';
import madlib from '../lib/madlib';
import range from '../lib/range';
import share from '../lib/share';

import Linechart from './linechart';
import Minimap from './minimap';

function validThreshold(value) {
    return value.length && value.replace(/[,0-9]+/, '').length === 0;
}

function formatThreshold(value) {
    var newValue = '';
    while (value.length > 3) {
        newValue = ',' + value.substr(-3) + newValue;
        value = value.substr(0, value.length - 3);
    }
    return value + newValue;
}

function parseThreshold(value) {
    return parseInt(value.replace(/[^0-9]/g, ''));
}


export default function User(el, onUpdate) {
    const $$ = (s, root=el) => [].slice.call(root.querySelectorAll(s));

    var currentWageEls, yearEls, ratioEls, thumbEl, minimapImgs = [], summaryEl;
    var periodSplits;
    var currentValue = {'year': endYear, 'threshold': 0};
    var linechart, areachart, lineData, width, height = 55;
    var isMobile;

    function init() {
        var minimap, year, img;

        el.innerHTML = template;

        madlib(el.querySelector('.js-wage'), $$('.js-wage-preset'), validThreshold, formatThreshold,
            parseThreshold, changeThreshold);

        currentWageEls = $$('.js-current-wage', document);
        yearEls = $$('.js-year');
        ratioEls = $$('.js-user-ratio');
        thumbEl = document.querySelector('.hp-range-slider__thumb');

        minimap = el.querySelector('.js-minimap');
        for (year = startYear; year <= endYear; year++) {
            img = document.createElement('img');
            minimapImgs[year] = new Minimap(minimap);
        }
        minimapImgs[endYear].show();

        $$('.js-share').forEach(shareEl => {
            var network = shareEl.getAttribute('data-network');
            shareEl.addEventListener('click', () => {
                var msg = ratioEls[0].textContent + ' of the country is beyond my means in ' + currentValue.year + '. ';
                share(network, msg);
            });
        });

        summaryEl = el.querySelector('.js-summary');
        stickyBar(el.querySelector('.js-summary-bar'), el.querySelector('.js-summary-anchor'));

        areachart = new Linechart('js-area', 'line-area', 266, height, 5, 0);
        range(el.querySelector('.js-date'), startYear, endYear, changeYear, 5);

        //resize line chart
        var resize = throttle(function() {
            drawAreachart();
        }, 200);

        window.addEventListener('resize', () => {
            resize();
            isMobile = window.innerWidth < 740;
        });
        isMobile = window.innerWidth < 740;

        changeThreshold(25000); // ugly way to initialise line chart
    }

    function change(type) {
        // height of thumb
        var ratio = periodSplits[currentValue.year].ratio,
            bottomNotSticky = 30 + ratio/2 + '%',
            isSticky = document.querySelector(".js-summary-bar").classList.contains("is-sticky");
        ratioEls.forEach(el => el.textContent = Math.floor(ratio) + '%');
        thumbEl.style.bottom = isSticky ? "25px" : bottomNotSticky;
        setBottomNotSticky(bottomNotSticky);
        
        if (type === 'end' || !isMobile) {
            setTimeout(() => onUpdate(currentValue), 0);
        }
    }

    function changeThreshold(threshold) {
        lineData = [];

        currentValue.threshold = threshold;
        currentWageEls.forEach(el => el.textContent = threshold.toLocaleString());

        periodSplits = getPeriodSplits(threshold);
        minimapImgs[currentValue.year].draw(periodSplits[currentValue.year].unaffordable);

        periodSplits.forEach((yearSplit, year) => {
            lineData.push({'x': year, 'y': yearSplit.ratio});
            window.requestAnimationFrame(() => minimapImgs[year].draw(yearSplit.unaffordable));
        }); 

        drawAreachart(); 
        //drawLinechart(linechart, "js-line", "line", lineData); 
        change('end');   
    }

    function changeYear(year, type) {
        window.requestAnimationFrame(() => {
            minimapImgs[currentValue.year].hide();
            minimapImgs[year].show();
            yearEls.forEach(el => el.textContent = currentValue.year = year);

            change(type);
        });
    }
    
    function drawAreachart() {
        var areaData = [{x:lineData[0].x, y:-0}].concat(
            lineData,
            {x: lineData[lineData.length-1].x, y: 0} 
        );
        
        drawLinechart(areachart, "js-area", "line-area", areaData);
    }

    function drawLinechart(chart, el, cn, data) {
        width  = document.querySelector("." + el).parentElement.clientWidth + 1; //1, tweak
        
        chart.updateWidth("." + el + " svg", width);
        chart.updateLine(data, cn, [0, width], [0, height], null, [0, 100]);
    }

    init();
}
