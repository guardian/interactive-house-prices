import template from './templates/user.html!text';
import throttle from '../lib/throttle';
import { startYear, endYear, getCountryMedian } from '../lib/region';

import madlib from '../lib/madlib';
import range from '../lib/range';

import Linechart from './linechart';

export default class User {
    constructor(el, districts, onUpdate) {
        this.el = el;
        this.el.innerHTML = template;

        this.districts = districts;
        this.onUpdate = onUpdate;

        this.labelEl = el.querySelector(".js-user-label");
        this.yearEl = el.querySelector('.js-year');
        this.ratiodiffEl = el.querySelector(".js-user-diff");
        this.ratioEls = Array.from(el.querySelectorAll('.js-user-ratio'));

        this.date = range(el.querySelector('.js-date'), startYear, endYear, this.changeYear.bind(this), 5);
        madlib(el.querySelector('.js-wage'), this.changeThreshold.bind(this));

        this.linechart = new Linechart(el.querySelector('.js-line'), 386, 30);

        this.value = {'year': startYear, 'threshold': 0};
        this.changeThreshold('25000'); // ugly way to initialise line chart
    }

    change() {
        var firstYear = this.medians[0].y;
        var currentYear = this.medians[this.value.year - startYear].y;

        // update user's line chart
        var left = (100 * (this.date.get() - startYear) / (endYear - startYear));
        this.labelEl.style.left = left + "%";
        this.ratioEls.forEach(el => {
            el.style.left = (left-0.8) + "%";
            el.textContent = Math.round(currentYear) + "%";
        });
        //this.ratiodiffEl.textContent = Math.round(firstYear) + "%";
        this.yearEl.textContent = this.value.year;

        this.onUpdate(this.value);
    }

    changeThreshold(threshold) {
        this.value.threshold = parseFloat(threshold.replace(/£,/g, ''));
        this.medians = getCountryMedian(this.districts, this.value.threshold);
        this.linechart.update(this.medians, 386, 100);

        this.change();
    }

    changeYear(year) {
        this.value.year = year;

        this.change();
    }
}
