import L from './lib/leaflet'
import topojson from 'mbostock/topojson'

import mainHTML from './text/main.html!text'
import areasTopo from './data/areas-topo.json!json'
import prices from './data/prices.json!json'

const postcodeAreas = Object.keys(prices);
const areasFeature = topojson.feature(areasTopo, areasTopo.objects.Areas);
areasFeature.features = areasFeature.features.filter(f => postcodeAreas.indexOf(f.id) !== -1);

const years = [2014, 2015];

console.log(areasFeature);

var selectedConstituency;

function initTime(el, areasLayer) {
    var statusEl = el.querySelector('#status');
    var timeEl = el.querySelector('#slider');
    var yearEl = el.querySelector('#year');
    var monthEl = el.querySelector('#month');

    function changeTime(year, month) {
        yearEl.textContent = year;
        monthEl.textContent = month < 10 ? '0' + month : month;

        areasLayer.setStyle(area => {
            var price = prices[area.id][year][month] / 25000;
            var c = Math.floor((1 - Math.min(1, price / 10)) * 255);
            return {
                'color': `rgb(${c}, ${c}, ${c})`
            };
        });
    }

    timeEl.addEventListener('input', evt => {
        var date = evt.target.value / 1000 * years.length * 12;
        var year = Math.floor(date / 12) + parseInt(years[0]);
        var month = Math.floor(date % 12) + 1;

        changeTime(year, month);
    });

    changeTime(2014, 1);
}

function initConstituencies(el, map) {
    var constituencyEl = el.querySelector('#live_in');

    constituencies.filter(c => c[0] === 'E').map(constituency => {
        var el = document.createElement('option');
        el.textContent = constituency;
        constituencyEl.appendChild(el);
    });

    constituencyEl.addEventListener('change', evt => {
        if (evt.target.value) {
            map.focusConstituency(evt.target.value);
        }
        selectedConstituency = evt.target.value;
    });

}

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

    initTime(el, areasLayer);
    //initConstituencies(el, map);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
