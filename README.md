# House prices

You need to install `pngquant`, then run:
```
./start.sh
```

`data.zip` comes with a list of postcode district town names, but if you want to get a fresh scrape
run:
```
wget https://en.wikipedia.org/wiki/List_of_postcode_districts_in_the_United_Kingdom -O tmp.html
python scrape-names.py < tmp.html > data/district-names.json`
```
You will need BeautifulSoup (`pip install beautifulsoup4`)

## Queries

NOTE: The table `houseprice_test` has a reduced dataset for testing, use instead of `houseprice` for
faster results

### Preprocessing

Calculating postcode districts from postcodes

```sql
UPDATE houseprice SET postcode_district=REGEXP_REPLACE(postcode, ' ?[0-9][A-Z][A-Z]$', '')
WHERE postcode_district = ''
```

Find all subdistricts (W1C, W1H, E1C, etc.)

```sql
SELECT postcode_district
FROM houseprice WHERE postcode_district ~ '[A-Z] ?$'
GROUP BY postcode_district
```

Convert subdistricts to districts
```sql
UPDATE houseprice SET postcode_district=REGEXP_REPLACE(postcode_district, '[A-Z] ?$', '')
WHERE postcode_district ~ '[A-Z] ?$'
```

### Result aggregation

The quick query (no tooltip data)
```sql
SELECT year_of_sale, postcode_district, MEDIAN(price2014)
FROM houseprice WHERE postcode_district != '' AND date_of_sale < '2015-01-01'
GROUP BY 1, 2
```

The full query
```sql
SELECT year_of_sale, postcode_district,
       (calc_quartiles(array_agg(price2014::real))).*,
       MAX(price2014) actual_max, MEDIAN(price2014)
FROM houseprice WHERE postcode_district != '' AND date_of_sale < '2015-01-01'
GROUP BY 1, 2
```

You will need this function:
```sql
DROP FUNCTION IF EXISTS calc_quartiles(real[]);
DROP TYPE IF EXISTS quartiles;

CREATE TYPE quartiles AS (
  q1 real,
  q3 real,
  iqr real,
  min real,
  max real,
  lower_fence real,
  upper_fence real,
  outer_fence real,
  buckets int
);
ALTER TYPE quartiles OWNER TO users;

CREATE FUNCTION calc_quartiles(myarray real[])
  RETURNS quartiles AS
$BODY$

DECLARE
  sorted real[];
  n int;
  half int;
  qtr int;
  q quartiles;
  i real;
  sample_n int;
BEGIN
  n = array_length(myarray, 1);
  sorted = array_sort(myarray);

  half = n / 2;
  if half & 1 then
    qtr = (half + 1) / 2;
    q.q1 = sorted[qtr];
    q.q3 = sorted[n - qtr + 1];
  else
    qtr = half / 2;
    q.q1 = (sorted[qtr] + sorted[qtr + 1]) / 2;
    q.q3 = (sorted[n - qtr] + sorted[n - qtr + 1]) / 2;
  end if;

  q.iqr = q.q3 - q.q1;
  q.lower_fence = q.q1 - 1.5 * q.iqr;
  q.upper_fence = q.q3 + 1.5 * q.iqr;
  q.outer_fence = q.q3 + 3 * q.iqr;

  q.min = sorted[1];
  sample_n = 0;
  foreach i in array sorted loop
    exit when i > q.upper_fence;
    q.max = i;
    sample_n = sample_n + 1;
  end loop;

  q.buckets = ceil(log(2, sample_n) + 1); -- sturges rule

  return q;
END;
$BODY$
  LANGUAGE plpgsql IMMUTABLE
  COST 100;
ALTER FUNCTION calc_quartiles(real[]) OWNER TO users;
```
