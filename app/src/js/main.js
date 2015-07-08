import { set as setConfig } from './lib/cfg'
import './lib/pointer-events'

import Intro from './components/intro';
import Map from './components/map'
import mainHTML from './templates/main.html!text'

function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;

    if (window.guardian) {
        el.style.height = window.innerHeight - document.getElementById('maincontent').offsetTop + 'px';
    }

    // While testing
    if (window.location.hash === '#intro') {
        var intro = new Intro(el.querySelector('.js-intro'));
    } else {
        el.querySelector('.js-intro').style.display = 'none';
    }

    var map = new Map(el);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
