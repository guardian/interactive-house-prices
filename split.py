#!/usr/bin/python
import sys, json, re
from collections import defaultdict

group_re = re.compile(sys.argv[1])

groups = defaultdict(list)

geojson = json.load(sys.stdin)
for feature in geojson['features']:
    group_name = group_re.search(feature['properties']['name']).group(0)
    groups[group_name].append(feature)

for group_name, group in groups.iteritems():
    json.dump({
        'crs': geojson['crs'],
        'features': group,
        'type': geojson['type']
    }, open('app/src/assets/topo/%s.json' % group_name, 'w'))
