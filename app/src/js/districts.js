importScripts('topojson.js');

self.addEventListener('message', function (e) {
    var topo = JSON.parse(e.data);
    self.postMessage(topojson.feature(topo, topo.objects.shapes));
});
