import template from './templates/user.html!text';
import throttle from '../lib/throttle';
import { startYear, endYear, getCountryMedian } from '../lib/region';

import Linechart from './linechart';

function madlib(el, onchange) {
    var expanded = false;
    var text = el.querySelector('.madlib__input__text'),
        expand = el.querySelector('.madlib__input__expand'),
        canned = el.querySelector('.madlib__input__canned__options');

    function toggle() {
        if (expanded) {
            el.removeAttribute('data-expanded');
        } else {
            el.setAttribute('data-expanded', '');
        }

        expanded = !expanded;
    }

    expand.addEventListener('click', evt => toggle());

    canned.addEventListener('change', evt => {
        var option = canned.options[canned.selectedIndex];
        text.placeholder = option.textContent;
        onchange(option.value);

        toggle();
        canned.selectedIndex = -1;
    });

    return {
        get: () => text.value,
        set: value => text.value = value
    };
}

export default class User {
    constructor(el, districts, onUpdate) {
        this.el = el;
        this.el.innerHTML = template;

        this.districts = districts;
        this.onUpdate = onUpdate;

        this.labelEl = el.querySelector(".js-user-label");
        this.ratiodiffEl = el.querySelector(".js-user-diff");
        this.ratioEls = Array.from(el.querySelectorAll('.js-user-ratio'));

        this.dateEl = el.querySelector('#date');
        this.dateEl.max = endYear - startYear;

        this.dateEl.addEventListener('input', throttle(function () {
            this.changeYear(startYear + parseInt(this.dateEl.value));
        }.bind(this), 50));

        madlib(el.querySelector('.js-wage'), this.changeThreshold.bind(this));

        this.linechart = new Linechart(el.querySelector('.js-line'), 400, 30);

        this.value = {'year': startYear, 'threshold': 0};
        this.changeThreshold(25000); // ugly way to initiate line chart
    }

    change() {
        var firstYear = this.medians[0].y;
        var currentYear = this.medians[this.value.year - startYear].y;

        // update user's line chart
        var left = (100*this.dateEl.value/this.dateEl.max);
        this.labelEl.style.left = left + "%";
        this.ratioEls.forEach(el => {
            el.style.left = (left-0.8) + "%";
            el.textContent = Math.round(currentYear) + "%";
        });
        this.ratiodiffEl.textContent = Math.round(currentYear - firstYear) + "%";

        this.onUpdate(this.value);
    }

    changeThreshold(threshold) {
        this.value.threshold = parseFloat(threshold);
        this.medians = getCountryMedian(this.districts, this.value.threshold);
        this.linechart.update(this.medians, 400, 100);

        this.change();
    }

    changeYear(year) {
        this.value.year = year;

        this.change();
    }
}
