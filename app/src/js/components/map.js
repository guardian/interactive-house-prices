import { periodMedians, getDistricts } from '../lib/region';
import { config } from '../lib/cfg';
import throttle from '../lib/throttle';
import isMobile from '../lib/is-mobile';

import Controls from './controls';
import Tooltip from './tooltip';

import bowser from 'ded/bowser';

const colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

export default function Map(el) {
    var map, tooltip, districtLayer, highlightLayer, userInput;

    // Stop resizing from showing address bar/keyboard but allow from hiding address bar
    var lastWidth, lastHeight = 0;
    function setContainerSize() {
        if (!bowser.mobile || window.innerWidth !== lastWidth || lastHeight < window.innerHeight) {
            lastWidth = window.innerWidth;
            lastHeight = window.innerHeight;
            el.style.height = (window.innerHeight - (isMobile() ? 0 : 48)) + 'px';
        }
    }
    window.addEventListener('resize', throttle(setContainerSize, 100));
    setContainerSize();

    function init(L) {
        // Hacky way of using presimiplified, preprojected points
        L.Polygon.prototype._simplifyPoints = function () {};

        map = L.map(el.querySelector('.js-map'), {
            'center': [53, -2.3],
            //'maxBounds': [[50, -6.5], [56, 1.8]],
            'maxZoom': 17,
            'minZoom': 6,
            'zoom': el.clientWidth > 600 ? 7 : 6,
            'fadeAnimation': false,
            'zoomControl': false
        });

        var renderer = L.canvas();
        renderer._initContainer();
        renderer._container.className += ' hp-map__highlight';

        highlightLayer = L.geoJson(undefined, {
            renderer: renderer,
            style: {
                fill: false,
                stroke: true,
                color: '#333',
                weight: 2
            },
            noClip: true
        }).addTo(map);

        // Region layer
        var districtRenderer = L.canvas();
        districtRenderer.suspendDraw = true;
        districtRenderer.skipClear = true;

        districtLayer = L.geoJson(undefined, {
            renderer: districtRenderer,
            style: setStyle,
            onEachFeature: setOnEachFeature,
            noClip: true
        }).addTo(map);

        // Leaflet's retina test
        var retina =
            (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1 ? '@2x' : '';

        // Label layer
        L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}${retina}.png?access_token={accessToken}`, {
            pane: 'overlayPane',
            id: 'guardian.b71bdefa',
            accessToken: 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg'
        }).addTo(map);

        getDistricts(res => {
            if (res.districts.length === 0) {
                districtRenderer.suspendDraw = false;
                districtLayer.setStyle(setStyle);
            } else {
                districtLayer.addData(res.districts);
                res.more();
            }
        });

        tooltip = new Tooltip(el);
        var controls = new Controls(el.querySelector('.js-map-controls'), showDistrict, showPosition);
    }

    function setStyle(district) {
        var price = userInput && periodMedians[userInput.year][district.id];
        var color;

        if (price) {
            let index = Math.floor(price / userInput.threshold) - 1;
            if (index > 8) color = '#ca2345';
            else color = colors[Math.max(0, Math.min(5, index))];
        } else {
            color = '#cccccc';
        }

        return {
            'stroke': 0,
            'fillColor': color,
            'fillOpacity': 1
        };
    }

    function highlight(feature, evt=null) {
        highlightLayer.clearLayers();
        highlightLayer.addData([feature]);
        tooltip.show(userInput, feature.id, evt);
    }

    function setOnEachFeature(feature, layer) {
        layer.on({
            mouseover: evt => highlight(feature, evt),
            mousemove: evt => tooltip.move(evt),
            mouseout: () => {
                highlightLayer.clearLayers();
                tooltip.hide();
            }
        });
    }

    this.update = function (data) {
        userInput = data;
        if (districtLayer) {
            districtLayer.setStyle(setStyle);
        }
    };

    function showDistrict(districtCode) {
        districtLayer.eachLayer(district => {
            if (district.feature.id === districtCode) {
                highlight(district.feature);
                map.flyTo(district.getCenter(), 12);
            }
        });
    };

    function showPosition(latlng, cb) {
        var point = map.latLngToLayerPoint(latlng);
        var districts = districtLayer.getLayers();

        function check(i) {
            if (districts[i]._containsPoint(point)) {
                highlight(districts[i].feature);
                map.flyTo(latlng, 12);
                cb();
            } else if (i < districts.length - 1) {
                window.requestAnimationFrame(check.bind(null, i + 1));
            }
        }

        window.requestAnimationFrame(check.bind(null, 0));
    };

    var script = document.createElement('script');
    script.src = config.assetPath + '/leaflet.js';
    script.onload = () => init(window.L);
    document.body.appendChild(script);
}
