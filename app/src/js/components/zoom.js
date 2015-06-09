import Topo from '../lib/topo'
import L from '../lib/leaflet'

var boundsCache = {};

export default class Zoom {
    constructor(el, map, areasLayer) {
        this.map = map;
        this.areasLayer = areasLayer;

        map.on('moveend', this.moveEnd.bind(this));

        Topo.get('areas').then(areas => areasLayer.addData(areas.geo));
    }

    getVisibleLayers() {
        var bounds = this.map.getBounds();
        return this.areasLayer.getLayers().filter(l => bounds.overlaps(l.getBounds()));
    }

    getDetailLevel() {
        var zoom = this.map.getZoom();
        return zoom > 11 ? Topo.SECTOR : zoom > 8 ? Topo.DISTRICT : Topo.AREA;
    }

    moveEnd() {
        var detailLevel = this.getDetailLevel();
        var visibleLayers = this.getVisibleLayers();

        // Group layers by which parent will need to be loaded
        var changingLayers = {};
        visibleLayers
            // TODO: remove when all TopoJSON
            .filter(l => Topo.getLevel(l.feature.id || l.feature.properties.name) != detailLevel)
            .map(layer => {
                var id = layer.feature.id || layer.feature.properties.name;
                var newId = Topo.getLevel(id) > detailLevel ? Topo.getParentId(id) : id;

                if (!changingLayers[newId]) changingLayers[newId] = [];
                changingLayers[newId].push(layer);
            });

        // We can't cancel Promises from previous moveend events, so just use
        // requestTime to check resolves against
        var requestTime = this.requestTime = Date.now();
        Object.keys(changingLayers).forEach(id => {
            Topo.get(id).then(data => {
                if (requestTime === this.requestTime) {
                    changingLayers[id].forEach(l => this.areasLayer.removeLayer(l));
                    // TODO: deduplicate the shapes
                    this.areasLayer.addData(data.geo);
                } else {
                    console.log('rejected', id);
                }
            });
        });
    }
}
