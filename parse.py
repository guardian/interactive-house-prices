#!/usr/bin/python
import sys, csv, json
from collections import defaultdict

totals = defaultdict(lambda: defaultdict(float))
counts = defaultdict(lambda: defaultdict(int))
maxs = defaultdict(lambda: defaultdict(float))
mins = defaultdict(lambda: defaultdict(lambda: 1000000000.0))
constituencies = defaultdict(lambda: defaultdict(lambda: {}))

for row in csv.DictReader(sys.stdin):
    avg = float(row['avg'])

    totals[row['year']][row['month']] += avg
    counts[row['year']][row['month']] += 1

    maxs[row['year']][row['month']] = max(maxs[row['year']][row['month']], avg)
    mins[row['year']][row['month']] = min(mins[row['year']][row['month']], avg)
    constituencies[row['gss']][row['year']][row['month']] = avg

averages = {
    year: {
        month: totals[year][month] / counts[year][month] for month in months.iterkeys()
    } for year, months in totals.iteritems()
}

print json.dumps({
    'constituencies': constituencies,
    'averages': averages,
    'maxs': maxs,
    'mins': mins
})
