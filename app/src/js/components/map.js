import { periodMedians, getDistricts, getRegionPrices } from '../lib/region'
import { config } from '../lib/cfg'
import throttle from '../lib/throttle'

import Tooltip from './tooltip'

const colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

// Hacky way of using presimiplified, preprojected points
function hackL(L) {
    var unitScale = L.CRS.EPSG3857.scale(0);

    L.LineUtil.simplify = function (points, tolerance) {
        return points;
    };

    L.Polyline.prototype._setLatLngs = function (latlngs) {
        this._bounds = new L.Bounds();
        this._latlngs = latlngs;
        this._points = [];
        this._rings = [];
        this._convertLatLngs(latlngs, this._points, this._rings, this._bounds);
    };

    L.Polyline.prototype._convertLatLngs =
    L.Polygon.prototype._convertLatLngs = function (latlngs, points, rings, bounds) {
        var i, len = latlngs.length, point, ring, p;

        if (L.Polyline._flat(latlngs)) {
            point = []; ring = [];
            for (i = 0; i < len; i++) {
                p  = new L.Point(latlngs[i].lng / unitScale, latlngs[i].lat / unitScale);
                point.push(p);
                ring.push(p.clone());
                bounds = bounds.extend(p);
            }
            points.push(point);
            rings.push(ring);
        } else {
            for (i = 0; i < len; i++) {

                this._convertLatLngs(latlngs[i], points, rings, bounds);
            }
        }
    }

    L.Polyline.prototype._project = function () {
        var scale = this._map.options.crs.scale(this._map.getZoom()),
            origin = this._map.getPixelOrigin();
        this._projectLatlngs(this._points, this._rings, scale, origin);

        // project bounds as well to use later for Canvas hit detection/etc.
        var w = this._clickTolerance(),
            bl = this._bounds.getBottomLeft(),
            tr = this._bounds.getTopRight();

        bl.x = Math.round(bl.x * scale) - origin.x - w;
        bl.y = Math.round(bl.y * scale) - origin.y + w;
        tr.x = Math.round(tr.x * scale) - origin.x + w;
        tr.y = Math.round(tr.y * scale) - origin.y - w;

        if (this._bounds.isValid()) {
            this._pxBounds = new L.Bounds(bl, tr);
        }
    };

    L.Polyline.prototype._projectLatlngs = function (points, rings, scale, origin) {
        var i, len = points.length;

        if (points[0] instanceof L.Point) {
            for (i = 0; i < len; i++) {
                var point = points[i], ring = rings[i];
                ring.x = Math.round(point.x * scale) - origin.x;
                ring.y = Math.round(point.y * scale) - origin.y;
            }
        } else {
            for (i = 0; i < len; i++) {
                this._projectLatlngs(points[i], rings[i], scale, origin);
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
