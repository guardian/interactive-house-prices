import sys, bs4, re, json
from collections import defaultdict

soup = bs4.BeautifulSoup(sys.stdin)

lookup = defaultdict(list)
for tr in soup.find(class_='wikitable').find_all('tr'):
    tds = tr.find_all('td');
    if len(tds):
        _, districts, town, _ = tds
        if town.a:
            town_name = town.a['title']
            district_lists = districts.find_all(text=True, recursive=False)
            district_names = [re.sub('[A-Z]+$', '', name.strip()) for names in district_lists for name in names.split(',')]

            # try to remove wiki page title disambiguations
            town_name = town_name.split(',')[0].strip().replace(' (town)', '')
            if town_name == 'London postal district':
                town_name = 'London'

            lookup[town_name].extend(list(set(district_names)))

print json.dumps(lookup)
