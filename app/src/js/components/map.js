import L from '../lib/leaflet'
import { getDistricts, getRegionPrices } from '../lib/region'

import Tooltip from './tooltip'
import User from './user'

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
        this.map = L.map(el.querySelector('.js-map'), {
            'center': [53, -2.3],
            //'maxBounds': [[50, -6.5], [56, 1.8]],
            'zoom': 7,
            'fadeAnimation': false
        });

        var renderer = L.canvas();
        renderer._initContainer();
        renderer._container.className += ' map__highlight';

        var highlightLayer = L.geoJson(undefined, {
            renderer: renderer,
            style: {
                fill: false,
                stroke: true,
                color: '#333',
                weight: 2
            }
        }).addTo(this.map);

        // Region layer
        this.regionLayer = L.geoJson(undefined, {
            renderer: L.canvas(),
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: evt => {
                        highlightLayer.addData([feature]);
                        this.tooltip.show(evt, this.data)
                    },
                    mouseout: () => {
                        highlightLayer.clearLayers();
                        this.tooltip.hide();
                    }
                });
            },
            noClip: true
        }).addTo(this.map);

        // Label layer
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            pane: 'overlayPane',
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            minZoom: 7,
            maxZoom: 14,
            id: 'guardian.b71bdefa',
            accessToken: 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg'
        }).addTo(this.map);

        getDistricts().then(geo => this.regionLayer.addData(geo));

        this.tooltip = new Tooltip(el);
        this.user = new User(el.querySelector('.js-user'), this.update.bind(this));
    }

    update(data) {
        this.data = data;

        this.regionLayer.options.style = function (region) {
            var price = getRegionPrices(region, data.year, data.month).med;
            var ratio = price / data.threshold;

            var colorIndex = 0;
            if (ratio > 2) colorIndex++;
            if (ratio > 3) colorIndex++;
            if (ratio > 4) colorIndex++;
            if (ratio > 5) colorIndex++;
            if (ratio > 6) colorIndex++;

            return {
                'stroke': 0,
                'fillColor': colors[colorIndex],
                'fillOpacity': 1
            };
        };

        // TODO: only update regions that need updating
        this.regionLayer.eachLayer(region => this.regionLayer.resetStyle(region));
    }
}
