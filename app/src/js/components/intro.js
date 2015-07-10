import template from './templates/intro.html!text'
import { config } from '../lib/cfg'
import { startYear } from '../lib/region'

const textDelay = 50;
const text = Array.from('If you earned the national average salary, this is where you could live.');
const textCount = text.length;

const imgDelay = 400;
const imgGroups = [3, 5, 5, 7];
const imgNos = Array.prototype.concat.apply([], imgGroups.map((n, i) => new Array(n).fill(i)));
const imgCount = imgNos.length;

export default class Intro {
    constructor(el) {
        el.innerHTML = template;
        this.imgs = imgGroups.map((n, i) => {
            var img = el.querySelector('.js-img-' + i);
            return {
                'img': img,
                'year': img.querySelector('.js-year'),
            };
        });

        var img = new Image();
        img.onload = this.imgTick.bind(this, 0);
        img.src = config.assetPath + '/assets/intro.png';

        var step0 = el.querySelector('.js-step-0');
        this.textEls = text.map(t => {
            var el = document.createElement('span');
            el.textContent = t;
            el.className = 'intro__text';
            step0.appendChild(el);
            return el;
        });

        console.log(this.textEls);

        this.textTick(0);
    }

    textTick(n) {
        window.requestAnimationFrame(() => {
            this.textEls[n].className += ' is-visible';
            if (n + 1 < textCount) {
                setTimeout(this.textTick.bind(this, n + 1), textDelay);
            }
        });
    }

    imgTick(n) {
        window.requestAnimationFrame(() => {
            var imgNo = imgNos[n];
            var group = this.imgs[imgNo];

            group.img.style.backgroundPositionX = (n / (imgCount - 1) * 100) + '%';
            if (imgNo != this.lastStepNo) {
                group.img.style.display = 'block';
                this.lastStepNo = imgNo;
            }
            group.year.textContent = startYear + n;

            if (n + 1 < imgCount) {
                setTimeout(this.imgTick.bind(this, n + 1), imgDelay);
            }
        });
    }
}
