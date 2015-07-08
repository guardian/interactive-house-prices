import template from './templates/user.html!text';
import Linechart from './linechart';
import throttle from '../lib/throttle';

const startYear = 2014;
const months = 12 + 2; // TODO: actual values

export default class User {
    constructor(el, onUpdate) {
        this.el = el;
        this.el.innerHTML = template;
        
        //this.linechart = new Linechart();
        this.onUpdate = onUpdate;

        this.dateEl = el.querySelector('#date');
        this.dateEl.addEventListener('input', throttle(function () {
            var date = this.dateEl.value / 100 * months;
            var year = Math.floor(date / 12) + parseInt(startYear);
            var month = Math.floor(date % 12) + 1;

            this.changeTime(year, month);
        }.bind(this), 50));

        /*
        this.statusEl = el.querySelector('#status');
        this.timeEl = el.querySelector('#slider');
        this.yearEl = el.querySelector('#year');
        this.monthEl = el.querySelector('#month');*/

        this.changeTime(2014, 1);
    }

    changeTime(year, month) {
        /*this.yearEl.textContent = year;
        this.monthEl.textContent = month < 10 ? '0' + month : month;*/

        this.onUpdate({'year': year, 'month': month, 'threshold': 25000});
        
        // update tooltip
        //this.tooltip.hide();
        /* TODO: show */
    }
}
