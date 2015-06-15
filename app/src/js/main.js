import { set as setConfig } from './lib/cfg'
import './lib/pointer-events'

import ChangeTime from './components/changeTime'
import Map from './components/map'

import mainHTML from './text/main.html!text'


function init(el, config) {
    setConfig(config);
    el.innerHTML = mainHTML;

    var map = new Map(el);
    var changeTime = new ChangeTime(el, (year, month) => {
        map.update({'year': year - 2014, 'month': month});
    });
    //var zoom = new Zoom(el, map, areasLayer);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
