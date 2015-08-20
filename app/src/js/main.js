// Polyfills
import './lib/pointer-events';
import './lib/classList';
import './lib/raf';

import { set as setConfig } from './lib/cfg';
import scrollTo from './lib/scroll-to';

import Map from './components/map';
import User from './components/user';

import mainHTML from './templates/main.html!text';

function preventScroll(evt) {
    evt.preventDefault();
}

export function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;
    var mapEl = el.querySelector('.js-map-container');

    var map = new Map(mapEl);
    var user = new User(el.querySelector('.js-user'), map);

    el.querySelector('.js-map-activate').addEventListener('click', evt => {
        el.className += ' is-map-active';
        scrollTo(mapEl);
        document.body.addEventListener('touchstart', preventScroll);
        document.body.addEventListener('touchmove', preventScroll);
    });
    el.querySelector('.js-map-deactivate').addEventListener('click', evt => {
        el.className = el.className.replace(/is-map-active/g, '').trim();
        scrollTo(document.body);
        document.body.removeEventListener('touchstart', preventScroll);
        document.body.removeEventListener('touchmove', preventScroll);
    });
}
