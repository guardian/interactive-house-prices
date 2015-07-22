import template from './templates/user.html!text'
import throttle from '../lib/throttle'
import { startYear, endYear, getCountryMedian } from '../lib/region'
import { config } from '../lib/cfg'

import madlib from '../lib/madlib'
import range from '../lib/range'

import Linechart from './linechart'

export default class User {
    constructor(el, districts, onUpdate) {
        this.el = el;
        this.el.innerHTML = template;

        this.districts = districts;
        this.onUpdate = onUpdate;

        this.yearEl = el.querySelector('.js-year');
        this.ratioEls = Array.from(el.querySelectorAll('.js-user-ratio'));

        this.date = range(el.querySelector('.js-date'), startYear, endYear, this.changeYear.bind(this), 5);
        madlib(el.querySelector('.js-wage'), this.changeThreshold.bind(this));

        var minimap = el.querySelector('.js-minimap');
        this.minimapImgs = [];
        for (var year = startYear; year <= endYear; year++) {
            var img = document.createElement('img');
            this.minimapImgs[year] = img;
            minimap.appendChild(img);
        }
        this.minimapImgs[startYear].style.display = 'block';

        this.linechart = new Linechart(el.querySelector('.js-line'), 250, 30);

        this.value = {'year': startYear, 'threshold': 0};
        this.changeThreshold(25000); // ugly way to initialise line chart
    }

    change() {
        var firstYear = this.medians[0].y;
        var currentYear = this.medians[this.value.year - startYear].y;

        // update user's line chart
        var left = (100 * (this.date.get() - startYear) / (endYear - startYear));
        this.ratioEls.forEach(el => {
            el.style.left = (left-0.8) + "%";
            el.textContent = Math.round(currentYear) + "%";
        });
        this.yearEl.textContent = this.value.year;

        this.onUpdate(this.value);
    }

    changeThreshold(threshold) {
        this.value.threshold = threshold;
        this.medians = getCountryMedian(this.districts, this.value.threshold);
        this.linechart.updatePath(this.medians);

        this.medians.forEach((median, year) => {
            this.minimapImgs[year + startYear].src =
                `${config.assetPath}/assets/minimap/${year + startYear}-${median.no}.png`;
        });

        this.change();
    }

    changeYear(year) {
        var lastYear = this.value.year;
        window.requestAnimationFrame(() => {
            this.minimapImgs[lastYear].style.display = 'none';
            this.minimapImgs[year].style.display = 'block';
        });

        this.value.year = year;

        this.change();
    }
}
