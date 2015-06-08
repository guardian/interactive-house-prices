#!/usr/bin/python
import sys, csv, json
from collections import defaultdict

postcode_areas = defaultdict(lambda: defaultdict(lambda: {}))

for row in csv.DictReader(sys.stdin):
    avg = float(row['avg'])
    postcode_areas[row['postcode_area']][row['year']][row['month']] = float(row['avg'])

print json.dumps(postcode_areas)
