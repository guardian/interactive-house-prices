import template from './templates/user.html!text';
import Linechart from './linechart';
import throttle from '../lib/throttle';

const startYear = 1995;
const endYear = 2014;

export default class User {
    constructor(el, onUpdate) {
        this.el = el;
        this.el.innerHTML = template;

        //this.linechart = new Linechart();
        this.onUpdate = onUpdate;

        this.dateEl = el.querySelector('#date');
        this.dateEl.max = endYear - startYear;
        this.dateEl.addEventListener('input', throttle(function () {
            var year = startYear + parseInt(this.dateEl.value);
            this.changeTime(year);
        }.bind(this), 50));

        this.changeTime(startYear);
    }

    changeTime(year) {
        this.onUpdate({'year': year, 'threshold': 25000});
        
        // update tooltip
        //this.tooltip.hide();
        /* TODO: show */
    }
}
