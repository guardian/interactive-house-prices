import template from './templates/user.html!text'
import throttle from '../lib/throttle'
import { startYear, endYear, getPeriodSplits } from '../lib/region'
import { config } from '../lib/cfg'

import madlib from '../lib/madlib'
import range from '../lib/range'

import Linechart from './linechart'

export default function User(el, onUpdate) {
    var yearEl, ratioEl, thumblineEl, minimapImgs = [];
    var periodSplits;
    var currentValue = {'year': startYear, 'threshold': 0};
    var linechart;

    function init() {
        var minimap, year, img;

        el.innerHTML = template;

        yearEl = el.querySelector('.js-year');
        ratioEl = el.querySelector('.js-user-ratio');
        thumblineEl = document.querySelector('.hp-range-slider__thumbline');

        range(el.querySelector('.js-date'), startYear, endYear, changeYear, 5);
        madlib(el.querySelector('.js-wage'), changeThreshold);

        minimap = el.querySelector('.js-minimap');
        for (year = startYear; year <= endYear; year++) {
            img = document.createElement('img');
            minimapImgs[year] = img;
            minimap.appendChild(img);
        }
        minimapImgs[startYear].style.display = 'block';

        linechart = new Linechart('js-line', 'line', 307, 55, 5, 0);

        changeThreshold(25000); // ugly way to initialise line chart
    }

    function change() {
        var ratio = periodSplits[currentValue.year].ratio;
        thumblineEl.style.height = (10 + ratio / 2) + 'px';
        ratioEl.textContent = Math.floor(ratio) + '%';

        onUpdate(currentValue);
    }

    function changeThreshold(threshold) {
        currentValue.threshold = threshold;

        periodSplits = getPeriodSplits(threshold);
        //linechart.updateLine(periodSplits, 'line');

        periodSplits.forEach((yearSplit, year) => {
            minimapImgs[year].src =
                `${config.assetPath}/assets/minimap/${year}-${yearSplit.unaffordable}.png`;
        });

        change();
    }

    function changeYear(year) {
        minimapImgs[currentValue.year].style.display = 'none';
        minimapImgs[year].style.display = 'block';

        currentValue.year = year;
        yearEl.textContent = currentValue.year;

        change();
    }

    init();
}
