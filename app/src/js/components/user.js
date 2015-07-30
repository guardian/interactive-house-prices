import template from './templates/user.html!text'

import throttle from '../lib/throttle'
import { startYear, endYear, getPeriodSplits } from '../lib/region'
import { config } from '../lib/cfg'
import madlib from '../lib/madlib'
import range from '../lib/range'
import share from '../lib/share'

import Linechart from './linechart'

function validThreshold(value) {
    return value.length && value.replace(/[,0-9]+/, '').length === 0;
}

function formatThreshold(value) {
    var newValue = '';
    value = value + '';
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
    const $$ = s => [].slice.call(el.querySelectorAll(s));

    var currentWageEl, yearEl, ratioEl, thumblineEl, minimapImgs = [];
    var periodSplits;
    var currentValue = {'year': endYear, 'threshold': 0};
    var linechart, lineData, width, height = 55;
    var isMobile;

    function init() {
        var minimap, year, img;

        el.innerHTML = template;

        madlib(el.querySelector('.js-wage'), $$('.js-wage-preset'), validThreshold, formatThreshold,
            parseThreshold, changeThreshold);

        currentWageEl = document.querySelector('.js-current-wage');
        yearEl = el.querySelector('.js-year');
        ratioEl = el.querySelector('.js-user-ratio');
        thumblineEl = document.querySelector('.hp-range-slider__thumbline');

        minimap = el.querySelector('.js-minimap');
        for (year = startYear; year <= endYear; year++) {
            img = document.createElement('img');
            minimapImgs[year] = img;
            minimap.appendChild(img);
        }
        minimapImgs[endYear].style.display = 'block';

        $$('.js-share').forEach(shareEl => {
            var network = shareEl.getAttribute('data-network');
            shareEl.addEventListener('click', () => {
                var msg = ratioEl.textContent + ' of the country is beyond my means in ' + currentValue.year + '. ';
                share(network, msg);
            });
        });

        linechart = new Linechart('js-line', 'line', 266, height, 5, 0);
        range(el.querySelector('.js-date'), startYear, endYear, changeYear, 5);

        //resize line chart
        var resize = throttle(function(){ drawLinechart(); }, 200); 
        window.addEventListener('resize', () => { 
            resize();
            isMobile = window.innerWidth < 740; 
        });
        isMobile = window.innerWidth < 740;

        changeThreshold(25000); // ugly way to initialise line chart
    }

    function change(type) {
        var ratio = periodSplits[currentValue.year].ratio;
        thumblineEl.style.height = (10 + ratio / 2) + 'px';
        ratioEl.textContent = Math.floor(ratio) + '%';

        if (type === 'end' || !isMobile) {
            setTimeout(() => onUpdate(currentValue), 0);
        }
    }

    function changeThreshold(threshold) {
        lineData = [];

        currentValue.threshold = threshold;
        currentWageEl.textContent = threshold.toLocaleString();

        periodSplits = getPeriodSplits(threshold);
        periodSplits.forEach((yearSplit, year) => {
            lineData.push({'x': year, 'y': yearSplit.ratio});
            minimapImgs[year].src =
                `${config.assetPath}/assets/minimap/${year}-${yearSplit.unaffordable}.png`;
        }); 

        drawLinechart(); 
        change('end');   
    }

    function changeYear(year, type) {
        window.requestAnimationFrame(() => {
            minimapImgs[currentValue.year].style.display = 'none';
            minimapImgs[year].style.display = 'block';
            yearEl.textContent = currentValue.year = year;

            change(type);
        });
    }
    
    function drawLinechart() {
        /*
        //CHECK: draw an area!?
        var last = lineData.length-1;
        lineData = lineData.concat(
            {x: lineData[last].x, y: 0}, 
            {x: lineData[0].x,    y: 0},
            lineData[0]
        );*/
        width  = document.querySelector(".js-line").clientWidth + 2; //2, tweak
        
        linechart.updateWidth(".js-line svg", width);
        linechart.updateLine(lineData, 'line', [0, width], [0, height], null, [0, 100]);
    }

    init();
}
