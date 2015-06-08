import L from 'leaflet';
import topojson from 'mbostock/topojson';

import mainHTML from './text/main.html!text';
import areaTopo from './data/areas-topo.json!json';
import areaName from './data/areas-name.json!json';
import salaryYear from './data/salary.json!json';
import pricesJson from './data/prices-2013-sector.json!json';
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

        constituencyPrices.forEach(constituency => {
            map.toggleConstituency(constituency.id, constituency.value < 6);
        });

        yearEl.textContent = year;
        monthEl.textContent = month < 10 ? '0' + month : month;

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

function displayTooltip(e) {
    var layer = e.target,
        postcodeArea = layer.feature.id;
    
    /* data */
    var avg, region,
        num = 0, sum = 0, fac = 0,
        max = 0, min = 1000000;

    // calc of areas and distrcts from sectors
    
    pricesJson
    .filter(d => d.postcode.indexOf(postcodeArea) !== -1)
    .forEach(d => {
        num += d.num;
        sum += d.num*d.avg;
        fac += d.num*d.factor;
        min = (d.min < min) ? d.min : min;
        max = (d.max > max) ? d.max : max;
        region = d.region;
    });
    
    min = min.toLocaleString();
    max = max.toLocaleString();
    avg = Math.round(sum/num).toLocaleString();
    fac = Math.round(fac*100/num)/100;
    /*
    console.log("num:", num);
    console.log("min:", min, "max:", max);
    console.log("avg:", avg);
    console.log("fac:", fac);
    */

    /* tooltip */
    var w = window,
        d = document;
    
    var tp = d.querySelector(".js-tooltip");
    tp.style.left = w.event.pageX + "px";    
    tp.style.top = w.event.pageY + "px";
    //tp.style.right = "10px";    
    //tp.style.top = "10px";
    
    var salary = salaryYear[2013][region],
        result = Math.round(salary*fac).toLocaleString(),
        range1 = Math.round(salary*6).toLocaleString(),
        range2 = Math.round(salary*12).toLocaleString();
    
    d.querySelector(".js-region").textContent = areaName[postcodeArea] + " [" + postcodeArea +/*","+region+*/ "]"; 
    d.querySelector(".js-result").textContent = result;
    d.querySelector(".js-range1").textContent = range1;
    d.querySelector(".js-range2").textContent = range2;
    d.querySelector(".js-factor").textContent = fac;    
    d.querySelector(".js-min").textContent = min;    
    d.querySelector(".js-avg").textContent = avg;    
    d.querySelector(".js-max").textContent = max;    

    var s = d.querySelectorAll(".js-salary");
    s[0].textContent = salary.toLocaleString();
    s[1].textContent = salary.toLocaleString();
    s[2].textContent = salary.toLocaleString();
    
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: displayTooltip
    });
}

function init(el) {
    el.innerHTML = mainHTML;

    // Create a bounding box for user
    var bottomLeft = L.latLng(50, -6.5), //50, -8.5
        topRight = L.latLng(56, 1.8),    //60,1.7
        bounds = L.latLngBounds(bottomLeft, topRight);

    var map = L.map('map').setView([51.505, -0.09], 7);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxBounds: bounds,
        minZoom: 6,
        maxZoom: 16,
        id: 'wpf500.9a8b026d',
        accessToken: 'pk.eyJ1Ijoid3BmNTAwIiwiYSI6ImUwY2JiYmEzYzFhMjM1NDNmN2U3NDgxOTA0NDZkY2MwIn0.AheQI8clLR9rK_Auf7r8Sw'
    }).addTo(map);
    //console.log(sectorsTopo.objects);
    
    var areas = topojson.feature(areaTopo, areaTopo.objects.Areas);
    L.geoJson(areas, {
        //style: style,
        onEachFeature: onEachFeature
    })
    .addTo(map);

    //initTime(el, map);
    //initConstituencies(el, map);
}

(window.define || System.amdDefine)(function() { return {init: init}; });
