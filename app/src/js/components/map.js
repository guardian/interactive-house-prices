import L from '../lib/leaflet'
import { getNewRegionId, getRegion } from '../lib/region'

function groupBy(objs, fn) {
    var ret = {};
    objs.forEach(function (obj) {
        var k = fn(obj);
        if (!ret[k]) ret[k] = [];
        ret[k].push(obj);
    });
    return ret;
}

function tileLayer(id, pane='tilePane') {
    return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        pane: pane,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        minZoom: 6,
        maxZoom: 16,
        id: id,
        accessToken: 'pk.eyJ1IjoiZ3VhcmRpYW4iLCJhIjoiNHk1bnF4OCJ9.25tK75EuDdgq5GxQKyD6Fg'
    });
}

export default class Map {
    constructor(el) {
        this.map = L.map('map').setView([53, -2.3], 7);

        // Map Layer
        tileLayer('guardian.cd3f3254').addTo(this.map);

        // Region layer
        this.regionLayer = L.geoJson(undefined, {
            className: 'map-regions'/*,
            TODO: delegate events
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: tooltip.show,
                    mouseout: tooltip.hide
                });
            }*/
        }).addTo(this.map);
        getRegion('areas', 'areas').then(geo => this.regionLayer.addData(geo));

        // Label layer
        var labelLayer = tileLayer('guardian.8c876c82', 'overlayPane').addTo(this.map);
        labelLayer.getContainer().className += ' map-labels';

        this.map.on('moveend', this.onMoveEnd.bind(this));
    }

    getRegionType() {
        var zoom = this.map.getZoom();
        return zoom > 11 ? 'sectors' : zoom > 8 ? 'districts' : 'areas';
    }

    getVisibleRegions() {
        var bounds = this.map.getBounds();
        return this.regionLayer.getLayers().filter(r => bounds.overlaps(r.getBounds()));
    }

    onMoveEnd() {
        var regionType = this.getRegionType();
        var badRegions = this.getVisibleRegions().filter(r => r.feature.properties.type !== regionType);
        var newRegions = groupBy(badRegions, r => getNewRegionId(r.feature.id, regionType));

        // We can't cancel Promises from previous moveend events, so just use
        // requestTime to check resolves against
        var requestTime = this.requestTime = Date.now();
        Object.keys(newRegions).forEach(id => {
            getRegion(regionType, id).then(geo => {
                if (requestTime === this.requestTime) {
                    newRegions[id].forEach(r => this.regionLayer.removeLayer(r));
                    // TODO: deduplicate the shapes
                    this.regionLayer.addData(geo);
                }
            });
        });
    }
}
