import L from './lib/leaflet';
import topojson from 'mbostock/topojson';
import { set as setConfig } from './lib/cfg';
import './lib/pointer-events';
import './lib/find';

import ChangeTime from './components/changeTime';
import Zoom from './components/zoom';
import {tooltip} from './components/displayTooltip';

import mainHTML from './text/main.html!text';

const mbToken = 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg';


function init(el, config) {
    setConfig(config);

    el.innerHTML = mainHTML;

    var map = L.map('map').setView([53, -2.3], 7);
    
    // layer of map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 6,
        maxZoom: 16,
        id: 'guardian.cd3f3254',
        accessToken: mbToken
    }).addTo(map);
    
    // layer of svg and events
    var areasLayer = L.geoJson(undefined, {
            className: 'map-area',
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: tooltip.show,
                    mouseout: tooltip.hide
                });
            }
        })
        .addTo(map);

    // layer of lables
    var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        pane: 'overlayPane',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 6,
        maxZoom: 16,
        id: 'guardian.8c876c82',
        accessToken: mbToken
    }).addTo(map);
    
    tiles.getContainer().className += ' map-labels';

    var changeTime = new ChangeTime(el, map, areasLayer);
    var zoom = new Zoom(el, map, areasLayer);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
