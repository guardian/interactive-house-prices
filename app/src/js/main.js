// Polyfills
import './lib/pointer-events'
import './lib/raf'

import { set as setConfig } from './lib/cfg'

import Intro from './components/intro'
import Map from './components/map'
import User from './components/user'

import mainHTML from './templates/main.html!text'

export function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;

    // While testing
    if (window.location.hash === '#intro') {
        var intro = new Intro(el.querySelector('.js-intro'));
    } else {
        el.querySelector('.js-intro').style.display = 'none';
    }

    var map = new Map(el.querySelector('.js-map'));
    var user = new User(el.querySelector('.js-user'), map.update);
}
