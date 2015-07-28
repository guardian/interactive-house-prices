import template from './templates/user.html!text'

import throttle from '../lib/throttle'
import { startYear, endYear, getPeriodSplits } from '../lib/region'
import { config } from '../lib/cfg'
import madlib from '../lib/madlib'
import range from '../lib/range'
import share from '../lib/share'

import Linechart from './linechart'

export default function User(el, onUpdate) {
    var yearEl, ratioEl, thumblineEl, minimapImgs = [];
    var periodSplits;
    var currentValue = {'year': endYear, 'threshold': 0};
    var linechart;
    var isMobile;

    function init() {
        var minimap, year, img;

        el.innerHTML = template;

        yearEl = el.querySelector('.js-year');
        ratioEl = el.querySelector('.js-user-ratio');
        thumblineEl = document.querySelector('.hp-range-slider__thumbline');

        madlib(el.querySelector('.js-wage'), changeThreshold);

        linechart = new Linechart('js-line', 'line', 266, 55, 5, 0);
        range(el.querySelector('.js-date'), startYear, endYear, changeYear, 5);

        minimap = el.querySelector('.js-minimap');
        for (year = startYear; year <= endYear; year++) {
            img = document.createElement('img');
            minimapImgs[year] = img;
            minimap.appendChild(img);
        }
        minimapImgs[endYear].style.display = 'block';

        [].slice.call(el.querySelectorAll('.js-share')).forEach(shareEl => {
            var network = shareEl.getAttribute('data-network');
            shareEl.addEventListener('click', () => {
                var msg = ratioEl.textContent + ' of the country is beyond my means in ' + currentValue.year + '. ';
                share(network, msg);
            });
        });

        window.addEventListener('resize', () => { isMobile = window.innerWidth < 740; });
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
        var lineData = [];

        currentValue.threshold = threshold;

        periodSplits = getPeriodSplits(threshold);
        periodSplits.forEach((yearSplit, year) => {
            lineData.push({'x': year, 'y': yearSplit.ratio});
            minimapImgs[year].src =
                `${config.assetPath}/assets/minimap/${year}-${yearSplit.unaffordable}.png`;
        });

        linechart.updateLine(lineData, 'line', null, [0, 100]);

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

    init();
}
