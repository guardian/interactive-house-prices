import hexagonsTopo from '../data/wpc-topo.json!json'
import topojson from 'mbostock/topojson'
import { utm, centroid } from '../lib/geo'

const svgns = 'http://www.w3.org/2000/svg';

function createPolygons(feature, clazz) {
    var coordinates = feature.geometry.coordinates;
    // When there are multiple polygons for a constituency the coordinates have
    // another dimension of unit length arrays, no time to work out why!
    if (feature.geometry.type === 'MultiPolygon') {
        coordinates = Array.prototype.concat.apply([], coordinates.map(s => s));
    }

    return coordinates.map(cs => {
        var points = cs.map(c => utm(c[1], c[0]));

        var path = 'M' + points.map(p => p.join(',')).join('L') + 'Z';
        var el = document.createElementNS(svgns, 'path');
        el.setAttributeNS(null, 'd', path);
        el.setAttribute('class', clazz);

        return {
            'path': el,
            'center': centroid(points)
        };
    });
}

function createText(feature, clazz) {
    var coordinate = feature.geometry.coordinates;
    var [x, y] = utm(coordinate[1], coordinate[0]);
    var el = document.createElementNS(svgns, 'text');
    el.setAttributeNS(null, 'x', x);
    el.setAttributeNS(null, 'y', y);
    el.setAttribute('class', clazz);
    el.textContent = feature.properties.name;
    return el;
}

function createConstituencies() {
    var group = document.createElementNS(svgns, 'g');
    var constituencies = {};

    var features = topojson.feature(hexagonsTopo, hexagonsTopo.objects.wpc).features;
    features.forEach(feature => {
        var shapes = createPolygons(feature, 'map-constituency');
        constituencies[feature.id] = {
            'paths': shapes.map(p => p.path).map(p => group.appendChild(p)),
            'center': centroid(shapes.map(p => p.center))
        };
    });

    return [group, constituencies];
}

function createRegions() {
    var group = document.createElementNS(svgns, 'g');

    var features = topojson.feature(regionsTopo, regionsTopo.objects.regions).features;
    var citiesFeatures = features.filter(d => d.geometry.type === 'Point' && d.properties.abbr);
    citiesFeatures.map(f => createText(f, 'map-region map-region--below')).forEach(el => group.appendChild(el));
    citiesFeatures.map(f => createText(f, 'map-region')).forEach(el => group.appendChild(el));

    return [group, {}];
}

export class CartogramLite {
    constructor(el, w, h) {
        var svg = document.createElementNS(svgns, 'svg');
        svg.setAttribute('viewBox', `${-w / 2} ${-h / 2} ${w} ${h}`);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        el.appendChild(svg);

        //var [regionContainer, _] = createRegions();
        var [constituencyContainer, constituencies] = createConstituencies();

        this.container = document.createElementNS(svgns, 'g');
        this.container.setAttribute('class', 'map-group');
        this.container.appendChild(constituencyContainer);
        //this.container.appendChild(regionContainer);
        svg.appendChild(this.container);

        this.constituencies = constituencies;
        this.constituencyContainer = constituencyContainer;
    }

    focusConstituency(ons_id, highlight=true) {
        var constituency = this.constituencies[ons_id];
        if (constituency != this.lastFocusedConstituency) {
            if (this.lastFocusedConstituency) {
                this.lastFocusedConstituency.paths.forEach(p => p.removeAttribute('data-selected'));
            }
            if (highlight) {
                constituency.paths.forEach(p => p.setAttribute('data-selected', ''));
            }

            var [x, y] = constituency.center;
            this.container.setAttributeNS(null, 'transform', `translate(${-x}, ${-y})`);

            this.lastFocusedConstituency = constituency;
        }
    }

    setConstituencyColor(ons_id, color) {
        this.constituencies[ons_id].paths.forEach(p => p.setAttribute('style', 'fill: ' + color));
    }

    toggleConstituency(ons_id, force) {
        var constituency = this.constituencies[ons_id];
        var show = force !== undefined ? force : !constituency.show;
        if (constituency.show !== show) {
            constituency.paths.forEach(p => p.setAttribute('data-show', show));
            constituency.show = show;
        }
    }

    getDistance(ons_id1, ons_id2) {
        var [x1, y1] = this.constituencies[ons_id1].center;
        var [x2, y2] = this.constituencies[ons_id2].center;
        var [xd, yd] = [x2 - x1, y2 - y1];
        return Math.sqrt(xd*xd + yd*yd);
    }

    lineBetween(ons_id1, ons_id2) {
        if (this.line) {
            this.line.parentNode.removeChild(this.line);
        }
        this.line = document.createElementNS(svgns, 'line');

        var [x1, y1] = this.constituencies[ons_id1].center;
        var [x2, y2] = this.constituencies[ons_id2].center;
        this.line.setAttributeNS(null, 'x1', x1);
        this.line.setAttributeNS(null, 'x2', x2);
        this.line.setAttributeNS(null, 'y1', y1);
        this.line.setAttributeNS(null, 'y2', y2);
        this.line.setAttribute('style', 'stroke: black');
        this.container.appendChild(this.line);
        console.log(this.line);
    }
}
