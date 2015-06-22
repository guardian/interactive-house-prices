import { set as setConfig } from './lib/cfg'
import './lib/pointer-events'

import Map from './components/map'
import User from './components/user'

import mainHTML from './text/main.html!text'

function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;
    var map = new Map(el);
    var user = new User(el, map.update.bind(map));
}

(window.define || System.amdDefine)(function() { return {init: init}; });
