import reqwest from 'ded/reqwest'
import topojson from 'mbostock/topojson'

import { config } from '../lib/cfg'

var topoCache = {};

export default class Topo {
    constructor(id, topo) {
        this.id = id;
        this.topo = topo;
    }

    get geo() {
        if (this.id === 'areas') {
            return topojson.feature(this.topo, this.topo.objects.shapes);
        } else {
            // TODO: apply TopoJSON to area/district files
            return this.topo;
        }
    }

    static get AREA() { return 0; }
    static get DISTRICT() { return 1; }
    static get SECTOR() { return 2; }

    static get(id) {
        return new Promise((resolve, reject) => {
            if (topoCache[id]) {
                resolve(topoCache[id]);
            } else {
                reqwest({
                    url: config.assetPath + '/assets/topo/' + id + '.json',
                    type: 'json',
                    crossOrigin: true,
                    success: data => {
                        topoCache[id] = new Topo(id, data);
                        resolve(topoCache[id]);
                    },
                    error: err => {
                        console.log(`Could not load topology for ${id}`);
                        reject(err);
                    }
                });
            }
        });
    }

    static getParentId(id) {
        switch (Topo.getLevel(id)) {
            case Topo.AREA: throw 'Topo.AREA has no parent';
            case Topo.DISTRICT: return 'areas';
            case Topo.SECTOR: return id.replace(/[0-9].*/, ''); // AA9A 9 -> AA
        }
    }

    static getLevel(id) {
        if (/ [0-9]/.test(id)) {
            return Topo.SECTOR;
        } else if (/[0-9][A-Z]?$/.test(id)) {
            return Topo.DISTRICT;
        }
        return Topo.AREA;
    }
}
