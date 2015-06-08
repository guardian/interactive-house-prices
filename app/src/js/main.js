import L from './lib/leaflet'
import topojson from 'mbostock/topojson'

import ChangeTime from './components/changeTime'

import mainHTML from './text/main.html!text'
import prices from './data/prices.json!json'
import areasTopo from './data/areas-topo.json!json'

const mbToken = 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg';

const postcodeAreas = Object.keys(prices);
const areasFeature = topojson.feature(areasTopo, areasTopo.objects.Areas);
areasFeature.features = areasFeature.features.filter(f => postcodeAreas.indexOf(f.id) !== -1);

function init(el) {
    el.innerHTML = mainHTML;

    var map = L.map('map').setView([51.505, -0.09], 7);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 7,
        maxZoom: 17,
        id: 'guardian.cd3f3254',
        accessToken: mbToken
    }).addTo(map);

    var areasLayer = L.geoJson(undefined, {'className': 'map-area'}).addTo(map);
    areasLayer.addData(areasFeature);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        pane: 'overlayPane',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 7,
        maxZoom: 17,
        id: 'guardian.8c876c82',
        accessToken: mbToken
    }).addTo(map);

    var changeTime = new ChangeTime(el, map, areasLayer);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
