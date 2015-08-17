import { periodMedians, getDistricts, getRegionPrices } from '../lib/region';
import { config } from '../lib/cfg';
import throttle from '../lib/throttle';
import isMobile from '../lib/is-mobile';
import locationTemplate from './templates/mapLocation.html!text';

const colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

export default function Map(el, tooltip) {
    var districtLayer, highlightLayer, userInput;

    function init(L) {
        // Hacky way of using presimiplified, preprojected points
        L.Polygon.prototype._simplifyPoints = function () {};

        function setContainerSize() {
            el.style.height = (window.innerHeight - (isMobile() ? 0 : 48)) + 'px';
        }
        window.addEventListener('resize', throttle(setContainerSize, 100));
        setContainerSize();

        var map = L.map(el, {
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

        // Label layer
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            pane: 'overlayPane',
            id: 'guardian.b71bdefa',
            accessToken: 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg',
            detectRetina: true
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
    }

    function setStyle(district) {
        var price = userInput && periodMedians[userInput.year][district.id];
        var color;

        if (price) {
            let index = Math.floor(price / userInput.threshold) - 1;
            if (index > 8) color = '#c33e5a';
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

    function setOnEachFeature(feature, layer) {
        layer.on({
            mouseover: evt => {
                highlightLayer.addData([feature]);
                tooltip.show(userInput, evt.target.feature.id, evt);
            },
            mousemove: evt => {
                tooltip.move(evt);
            },
            mouseout: () => {
                highlightLayer.clearLayers();
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
    };

    var script = document.createElement('script');
    script.src = config.assetPath + '/leaflet.js';
    script.onload = function (evt) {
        init(window.L);
    };
    document.body.appendChild(script);
}
