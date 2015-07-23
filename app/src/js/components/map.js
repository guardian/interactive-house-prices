import L from '../lib/leaflet';
import { periodMedians, getDistricts, getRegionPrices } from '../lib/region';

import User from './user';
import Tooltip from './tooltip';

const colors = ['#39a4d8', '#8ac7cd', '#daeac1', '#fdd09e', '#f58680', '#ed3d61'];

// Hacky way of using presimplified TopoJSON
var projectLatlngs = L.Polyline.prototype._projectLatlngs;

L.LineUtil.simplify = function (points, tolerance) {
    return points;
}.bind(this);

L.Polyline.prototype._projectLatlngs = function (latlngs, result) {
    var zoom = this._map.getZoom();
    if (latlngs[0] instanceof L.LatLng) {
        latlngs = latlngs.filter(latlng => !latlng.alt || latlng.alt <= zoom);
    }
    projectLatlngs.call(this, latlngs, result);
};

export default class Map {
    constructor(el) {
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

        var highlightLayer = L.geoJson(undefined, {
            renderer: renderer,
            style: {
                fill: false,
                stroke: true,
                color: '#333',
                weight: 2
            }
        }).addTo(map);

        // Region layer
        var regionRenderer = L.canvas();
        regionRenderer.suspendDraw = true;
        this.districtLayer = L.geoJson(undefined, {
            renderer: regionRenderer,
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: evt => {
                        highlightLayer.addData([feature]);
                        //this.tooltip.show(evt, this.data);
                    },
                    mouseout: () => {
                        highlightLayer.clearLayers();
                        //this.tooltip.hide();
                    }
                });
            },
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
                map.fire('viewreset');
            } else {
                this.districtLayer.addData(res.districts);
                res.more();
            }
        });

        this.user = new User(el.querySelector('.js-user'), this.update.bind(this));
        this.tooltip = new Tooltip(el);
    }

    update(data) {
        this.data = data;

        this.districtLayer.options.style = function (district) {
            var price = periodMedians[data.year][district.id];
            var ratio = price / data.threshold;
            var color, colorIndex = 0;

            if (!price) {
                color = '#cccccc';
            } else {
                if (ratio > 2) colorIndex++;
                if (ratio > 3) colorIndex++;
                if (ratio > 4) colorIndex++;
                if (ratio > 5) colorIndex++;
                if (ratio > 6) colorIndex++;
                color = colors[colorIndex];
            }

            return {
                'stroke': 0,
                'fillColor': color,
                'fillOpacity': 1
            };
        };

        // TODO: only update regions that need updating
        this.districtLayer.eachLayer(district => this.districtLayer.resetStyle(district));
    }
}
