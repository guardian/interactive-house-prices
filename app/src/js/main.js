import { set as setConfig } from './lib/cfg'
import './lib/pointer-events'

import Map from './components/map'
import mainHTML from './templates/main.html!text'

function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;

    if (window.guardian) {
        el.style.height = window.innerHeight - document.getElementById('maincontent').offsetTop + 'px';
    }

    var map = new Map(el);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
