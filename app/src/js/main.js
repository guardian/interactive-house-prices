// Polyfills
import './lib/pointer-events'
import './lib/raf'

import { set as setConfig } from './lib/cfg'
import throttle from './lib/throttle'

import Intro from './components/intro';
import Map from './components/map'
import mainHTML from './templates/main.html!text'

function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML.replace('%assetPath%', config.assetPath);

    if (window.guardian) {
        var setContainerSize = throttle(() => {
            el.style.height = window.innerHeight - document.getElementById('maincontent').offsetTop + 'px';
        }, 100);
        window.addEventListener('resize', () => window.requestAnimationFrame(setContainerSize));
        setContainerSize();
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
