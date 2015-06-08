import L from 'leaflet'
import topojson from 'mbostock/topojson'

import mainHTML from './text/main.html!text'
import areasTopo from './data/areas-topo.json!json'
//import prices from './data/prices.json!json'
//import wages from './data/wages.json!json'

//const years = Object.keys(prices.mins).sort();
//const constituencies = Object.keys(prices.constituencies).filter(c => c[0] === 'E');

var selectedConstituency;

function initTime(el, map) {
    var statusEl = el.querySelector('#status');
    var timeEl = el.querySelector('#slider');
    var yearEl = el.querySelector('#year');
    var monthEl = el.querySelector('#month');

    function changeTime(year, month) {
        var constituencyPrices = constituencies.map(ons_id => {
                var price = prices.constituencies[ons_id];
                var theyear = year;
                var themonth = month;
                while (!(price[''+theyear] && price[''+theyear][''+themonth])) {
                    themonth--;
                    if (themonth === 0) {
                        theyear--;
                        themonth = 12;
                    }
                }

                return {
                    'id': ons_id,
                    'value': price[''+theyear][''+themonth] / wages[year]
                };
            });

        yearEl.textContent = year;
        monthEl.textContent = month < 10 ? '0' + month : month;

        constituencyPrices.forEach(constituency => {
            map.toggleConstituency(constituency.id, constituency.value < 6);
        });

        if (selectedConstituency) {
            let availableConstituencies = constituencyPrices.filter(c => c.value < 6);

            if (availableConstituencies.map(c => c.id).indexOf(selectedConstituency) !== -1) {
                statusEl.textContent = 'You can live here!';
            } else {
                var distances = availableConstituencies.map(constituency => {
                    return {
                        'id': constituency.id,
                        'd': map.getDistance(constituency.id, selectedConstituency)
                    };
                });
                var minD = distances.reduce((a, b) => a.d < b.d ? a : b);
                console.log(minD);
                map.lineBetween(selectedConstituency, minD.id);
                statusEl.textContent = 'You need more $$$';
            }
        }
    }

    timeEl.addEventListener('input', evt => {
        var date = evt.target.value / 1000 * years.length * 12;
        var year = Math.floor(date / 12) + parseInt(years[0]);
        var month = Math.floor(date % 12) + 1;

        changeTime(year, month);
    });

    changeTime(1995, 1);
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

    var feature = topojson.feature(areasTopo, areasTopo.objects.Areas);
    L.geoJson(feature).addTo(map);

    //initTime(el, map);
    //initConstituencies(el, map);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
