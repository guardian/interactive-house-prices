// Polyfills
import './lib/pointer-events';
import './lib/classList';
import './lib/raf';

import { set as setConfig } from './lib/cfg';
import scrollTo from './lib/scroll-to';

import Map from './components/map';
import User from './components/user';

import mainHTML from './templates/main.html!text';

var scrollY;
export function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;
    var mapEl = el.querySelector('.js-map-container');

    var map = new Map(mapEl);
    var user = new User(el.querySelector('.js-user'), map);

    function deactivateMap() {
        el.className = el.classList.remove('is-map-active');
        document.body.removeEventListener('touchstart', preventScroll);
        document.body.removeEventListener('touchmove', preventScroll);
    }

    function preventScroll(evt) {
        if (window.pageYOffset === scrollY) {
            evt.preventDefault();
        } else {
            deactivateMap();
        }
    }


    el.querySelector('.js-map-activate').addEventListener('click', evt => {
        scrollY = scrollTo(mapEl);
        el.classList.add('is-map-active');
        document.body.addEventListener('touchstart', preventScroll);
        document.body.addEventListener('touchmove', preventScroll);
    });
    el.querySelector('.js-map-deactivate').addEventListener('click', evt => {
        scrollTo(document.body);
        deactivateMap();
    });
}
