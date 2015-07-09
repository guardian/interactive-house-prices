import template from './templates/intro.html!text'
import { config } from '../lib/cfg'
import { startYear } from '../lib/region'

const delay = 400;
const groups = [3, 5, 5, 7];

const stepNos = Array.prototype.concat.apply([], groups.map((n, i) => new Array(n).fill(i)));
const stepCount = stepNos.length;

export default class Intro {
    constructor(el) {
        el.innerHTML = template;
        this.steps = groups.map((n, i) => {
            var img = el.querySelector('.js-img-' + i);
            return {
                'img': img,
                'year': img.querySelector('.js-year'),
            };
        });

        var img = new Image();
        img.onload = this.step.bind(this, 0);
        img.src = config.assetPath + '/assets/intro.png';
    }

    step(n) {
        window.requestAnimationFrame(() => {
            var stepNo = stepNos[n];
            var group = this.steps[stepNo];

            group.img.style.backgroundPositionX = (n / (stepCount - 1) * 100) + '%';
            if (stepNo != this.lastStepNo) {
                group.img.style.display = 'block';
                this.lastStepNo = stepNo;
            }
            group.year.textContent = startYear + n;

            if (n + 1 < stepCount) {
                setTimeout(this.step.bind(this, n + 1), delay);
            }
        });
    }
}
