import template from './templates/intro.html!text'
import { config } from '../lib/cfg'
import { startYear } from '../lib/region'

const textDelay = 50;
const text = ['If you earned the national average salary,', 'this is where you could live.'];
const textCount = text.length;

const imgDelay = 400;
const imgGroups = [3, 5, 5, 7];
const imgNos = [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3];
//const imgNos = Array.prototype.concat.apply([], imgGroups.map((n, i) => new Array(n).fill(i)));
const imgCount = imgNos.length;

export default function Intro(el) {
    var lastStepNo, imgs, textEls;

    function init() {
        var preload, step0;

        el.innerHTML = template;

        imgs = imgGroups.map((n, i) => {
            var img = el.querySelector('.js-img-' + i);
            return {
                'img': img,
                'year': img.querySelector('.js-year'),
            };
        });

        preload = new Image();
        preload.onload = imgTick.bind(null, 0);
        preload.src = config.assetPath + '/assets/intro.png';

        step0 = el.querySelector('.js-step-0');
        textEls = text.map(t => {
            var el = document.createElement('span');
            el.textContent = t;
            el.className = 'intro__text';
            step0.appendChild(el);
            return el;
        });

        textTick(0);
    }

    function textTick(n) {
        window.requestAnimationFrame(() => {
            textEls[n].className += ' is-visible';
            if (n + 1 < textCount) {
                setTimeout(textTick.bind(null, n + 1), textDelay);
            }
        });
    }

    function imgTick(n) {
        window.requestAnimationFrame(() => {
            var imgNo = imgNos[n];
            var group = imgs[imgNo];

            group.img.style.backgroundPositionX = (n / (imgCount - 1) * 100) + '%';
            if (imgNo !== lastStepNo) {
                group.img.style.display = 'block';
                lastStepNo = imgNo;
            }
            group.year.textContent = startYear + n;

            if (n + 1 < imgCount) {
                setTimeout(imgTick.bind(null, n + 1), imgDelay);
            }
        });
    }

    init();
}
