import L from './lib/leaflet'
import topojson from 'mbostock/topojson'

import ChangeTime from './components/changeTime'

import mainHTML from './text/main.html!text'
import prices from './data/prices.json!json'
import areasTopo from './data/areas-topo.json!json'

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
        id: 'wpf500.9a8b026d',
        accessToken: 'pk.eyJ1Ijoid3BmNTAwIiwiYSI6ImUwY2JiYmEzYzFhMjM1NDNmN2U3NDgxOTA0NDZkY2MwIn0.AheQI8clLR9rK_Auf7r8Sw'
    }).addTo(map);

    var areasLayer = L.geoJson(undefined, {'className': 'map-area'}).addTo(map);
    areasLayer.addData(areasFeature);

    var changeTime = new ChangeTime(el, map, areasLayer);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
