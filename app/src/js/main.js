// Polyfills
import './lib/pointer-events'
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
}
