import template from './templates/user.html!text';
import throttle from '../lib/throttle';
import { startYear, endYear } from '../lib/region';

export default class User {
    constructor(el, data, onUpdate) {
        this.el = el;
        this.el.innerHTML = template;

        this.onUpdate = onUpdate;
        
        this.labelEl = el.querySelector(".js-user-label");        
        this.ratiodiffEl = el.querySelector(".js-user-diff"); 
        this.ratioEls = Array.from(this.el.querySelectorAll('.js-user-ratio'));
        
        this.dateEl = el.querySelector('#date');
        this.dateEl.max = endYear - startYear;
        this.dateEl.ratio = data[0].y;
        this.dateEl.addEventListener('input', throttle(function () {
            var year = startYear + parseInt(this.dateEl.value);
            var yearDiff = year - startYear;
            var dataYear = data.filter(d => d.x === yearDiff);
            this.changeTime(year, yearDiff, dataYear[0].y);
        }.bind(this), 50));
        
        this.changeTime(startYear, 0, this.dateEl.ratio);
    }

    changeTime(year, yearDiff, ratioYear) {
        this.onUpdate({'year': year, 'threshold': 25000});
        
        // update user's line chart
        var left = (100*yearDiff/this.dateEl.max) + "%";
        this.labelEl.style.left = left;
        this.ratioEls.forEach(el => {
            el.style.left = left;
            el.textContent = Math.round(ratioYear*10)/10 + "%";
        });
        this.ratiodiffEl.textContent = Math.round((ratioYear - this.dateEl.ratio)*10)/10 + "%";
        
        // update tooltip
        //this.tooltip.hide();
        /* TODO: show */
    }
}
