importScripts('topojson.js');

var features, i = 0;
self.addEventListener('message', function (e) {
    var topo;

    switch (e.data.action) {
        case 'data':
            topo = JSON.parse(e.data.data);
            features = topojson.feature(topo, topo.objects.shapes).features;
        // deliberate fall-through
        case 'more':
            self.postMessage(features.slice(i, i += 20));
            break;
    }
});
