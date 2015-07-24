import { periodMedians, getDistricts, getRegionPrices } from '../lib/region';

import Tooltip from './tooltip';

const colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

function hackL(L) {
    // Hacky way of using presimplified TopoJSON
    var projectLatlngs = L.Polyline.prototype._projectLatlngs;

    L.LineUtil.simplify = function (points, tolerance) {
        return points;
    };

    L.Polyline.prototype._projectLatlngs = function (latlngs, result) {
        var zoom = this._map.getZoom();
        if (latlngs[0] instanceof L.LatLng) {
            latlngs = latlngs.filter(latlng => !latlng.alt || latlng.alt <= zoom);
        }
        projectLatlngs.call(this, latlngs, result);
    };
}

export default function Map(el) {
    var tooltip, districtLayer, highlightLayer, userInput;

    function init(L) {
        hackL(L);

        var map = L.map(el.querySelector('.js-map'), {
            'center': [53, -2.3],
            //'maxBounds': [[50, -6.5], [56, 1.8]],
            'maxZoom': 17,
            'minZoom': 6,
            'zoom': el.clientWidth > 600 ? 7 : 6,
            'fadeAnimation': false
        });
        map.zoomControl.setPosition('bottomright');

        var renderer = L.canvas();
        renderer._initContainer();
        renderer._container.className += ' hp-map__highlight';

        /*highlightLayer = L.geoJson(undefined, {
            renderer: renderer,
            style: {
                fill: false,
                stroke: true,
                color: '#333',
                weight: 2
            }
        }).addTo(map);*/

        // Region layer
        var regionRenderer = L.canvas();
        regionRenderer.suspendDraw = true;

        districtLayer = L.geoJson(undefined, {
            renderer: regionRenderer,
            style: setStyle,
            onEachFeature: setOnEachFeature,
            noClip: true
        }).addTo(map);

        // Label layer
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            pane: 'overlayPane',
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'guardian.b71bdefa',
            accessToken: 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg'
        }).addTo(map);

        getDistricts(res => {
            if (res.districts.length === 0) {
                regionRenderer.suspendDraw = false;
            } else {
                districtLayer.addData(res.districts);
                res.more();
            }
        });

        tooltip = new Tooltip(el);
    }

    function setStyle(district) {
        var price = userInput && periodMedians[userInput.year][district.id];
        var color;

        if (price) {
            let ratio = price / userInput.threshold;
            color = colors[Math.min(5, Math.floor(ratio) - 1)];
        } else {
            color = '#cccccc';
        }

        return {
            'stroke': 0,
            'fillColor': color,
            'fillOpacity': 1
        };
    }

    function setOnEachFeature(feature, layer) {
        layer.on({
            mouseover: evt => {
                //highlightLayer.addData([feature]);
                tooltip.show(evt, userInput);
            },
            mousemove: evt => {
                tooltip.move(evt);
            },
            mouseout: () => {
                //highlightLayer.clearLayers();
                tooltip.hide();
            }
        });
    }

    this.update = function (data) {
        userInput = data;

        // TODO: only update regions that need updating
        if (districtLayer) {
            districtLayer.eachLayer(district => districtLayer.resetStyle(district));
        }
    }

    var script = document.createElement('script');
    script.src = 'http://93f9fca.ngrok.com/leaflet.js';
    script.onload = function (evt) {
        init(window.L);
    }
    document.body.appendChild(script);
};
