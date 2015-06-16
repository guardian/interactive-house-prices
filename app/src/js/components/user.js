const startYear = 2014;
const months = 12 + 2; // TODO: actual values

export default class User {
    constructor(el, onUpdate) {
        this.statusEl = el.querySelector('#status');
        this.timeEl = el.querySelector('#slider');
        this.yearEl = el.querySelector('#year');
        this.monthEl = el.querySelector('#month');

        this.onUpdate = onUpdate;

        this.timeEl.addEventListener('input', evt => {
            var date = evt.target.value / 100 * months;
            var year = Math.floor(date / 12) + parseInt(startYear);
            var month = Math.floor(date % 12) + 1;

            this.changeTime(year, month);
        });

        this.changeTime(2014, 1);
    }

    changeTime(year, month) {
        this.yearEl.textContent = year;
        this.monthEl.textContent = month < 10 ? '0' + month : month;

        this.onUpdate({'year': year, 'month': month, 'threshold': 40000});
    }
}
