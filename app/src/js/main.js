// Polyfills
import './lib/pointer-events'
import './lib/classList'
import './lib/raf'

import { set as setConfig } from './lib/cfg'

import Map from './components/map'
import User from './components/user'

import mainHTML from './templates/main.html!text'

export function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;

    var map = new Map(el.querySelector('.js-map'));
    var user = new User(el.querySelector('.js-user'), map.update);

    el.querySelector('.js-map-activate').addEventListener('click', evt => {
        evt.preventDefault();
        el.className += ' is-map-active';
    });
    el.querySelector('.js-map-deactivate').addEventListener('click', evt => {
        el.className = el.className.replace(/is-map-active/g, '').trim();
    });
}
