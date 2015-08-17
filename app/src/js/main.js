// Polyfills
import './lib/pointer-events';
import './lib/classList';
import './lib/raf';

import { set as setConfig } from './lib/cfg';
import scrollTo from './lib/scroll-to';

import Map from './components/map';
import User from './components/user';
import Controls from './components/controls';
import Tooltip from './components/tooltip';

import mainHTML from './templates/main.html!text';

export function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;
    var mapEl = el.querySelector('.js-map');
    
    var tooltip = new Tooltip(mapEl);
    var map = new Map(mapEl, tooltip);
    var user = new User(el.querySelector('.js-user'), map.update, tooltip);
    
    el.querySelector('.js-map-activate').addEventListener('click', evt => {
        el.className += ' is-map-active';
        scrollTo(mapEl);
    });
    el.querySelector('.js-map-deactivate').addEventListener('click', evt => {
        el.className = el.className.replace(/is-map-active/g, '').trim();
        scrollTo(document.body);
    });
    
    //TODO: check again
    var controls = new Controls(el.querySelector('.js-map-controls'), map);
}
