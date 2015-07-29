import { periodMedians, getDistricts, getRegionPrices } from '../lib/region'
import { config } from '../lib/cfg'
import throttle from '../lib/throttle'

import Tooltip from './tooltip';

const projectionMultiplier = 250;
const colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

// Hacky way of using presimiplified, preprojected points
function hackL(L) {
    function unproject(point) {
        return L.CRS.EPSG3857.pointToLatLng(point, -8);

    }

    L.LineUtil.simplify = function (points, tolerance) {
        return points;
    };

    L.Polyline.prototype._convertLatLngs = function (latlngs) {
        var result = [],
            flat = L.Polyline._flat(latlngs),
            bounds, tr, bl;

        if (flat) {
            bounds = new L.Bounds();
            for (var i = 0, len = latlngs.length; i < len; i++) {
                result[i] = new L.Point(latlngs[i].lng / projectionMultiplier, latlngs[i].lat / projectionMultiplier);
                bounds = bounds.extend(result[i]);
            }
            tr = bounds.getTopRight();
            bl = bounds.getBottomLeft();
            this._bounds = this._bounds.extend(new L.LatLngBounds(unproject(tr), unproject(bl)));
        } else {
            for (var i = 0, len = latlngs.length; i < len; i++) {
                result[i] = this._convertLatLngs(latlngs[i]);
            }
        }

        return result;
    };

    L.Polyline.prototype._projectedToPoint = function (points) {
        var scale = this._map.options.crs.scale(this._map.getZoom()),
            origin = this._map.getPixelOrigin();

        var i, len = points.length, ring = [];
        for (i = 0; i < len; i++) {
            ring[i] = new L.Point(
                Math.round(points[i].x * scale) - origin.x,
                Math.round(points[i].y * scale) - origin.y
            );
        }
        return ring;
    }

    L.Polyline.prototype._projectLatlngs = function (latlngs, result) {
        var i, len;

        if (latlngs[0] instanceof L.Point) {
            result.push(this._projectedToPoint(latlngs));
        } else {
            for (i = 0, len = latlngs.length; i < len; i++) {
                this._projectLatlngs(latlngs[i], result);
            }
        }
    };
}

export default function Map(el) {
    var tooltip, districtLayer, highlightLayer, userInput;

    function init(L) {
        hackL(L);

        var setContainerSize = throttle(() => {
            el.style.height = (window.innerHeight - (window.guardian ? 48 : 0)) + 'px';
        }, 100);
        window.addEventListener('resize', () => window.requestAnimationFrame(setContainerSize));
        setContainerSize();

        var map = L.map(el, {
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

        highlightLayer = L.geoJson(undefined, {
            renderer: renderer,
            style: {
                fill: false,
                stroke: true,
                color: '#333',
                weight: 2
            }
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
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'guardian.b71bdefa',
            accessToken: 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg',
            detectRetina: true
        }).addTo(map);

        getDistricts(res => {
            if (res.districts.length === 0) {
                districtRenderer.suspendDraw = false;
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
                highlightLayer.addData([feature]);
                tooltip.show(evt, userInput);
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
    }

    var script = document.createElement('script');
    script.src = config.assetPath + '/leaflet.js';
    script.onload = function (evt) {
        init(window.L);
    }
    document.body.appendChild(script);
};
