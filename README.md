# House prices

You need to install `pngquant`, then run:
```
./start.sh
```

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

The quick query (no ranges in tooltip)
```sql
SELECT EXTRACT(year FROM date_of_sale) AS year,
       postcode_district AS id,
       MEDIAN(price2014), MIN(price2014), MAX(price2014), COUNT(*)
FROM houseprice WHERE postcode_district != ''
GROUP BY year, postcode_district
ORDER BY year
```

The full query
```sql
WITH a AS (
SELECT year_of_sale,
       postcode_district,
       (calc_quartiles(array_agg(price2014::real))).*
FROM houseprice WHERE postcode_district = 'GL50'
GROUP BY year_of_sale, postcode_district
),
b AS (
SELECT h.year_of_sale,
       h.postcode_district,
       price2014,
       FLOOR((price2014 - a.min) / ((a.max - a.min) / 6)) AS group,
       CASE WHEN price2014 > a.upper_fence AND price2014 <= a.outer_fence THEN 1 END AS near_outlier,
       CASE WHEN price2014 > a.outer_fence THEN 1 END AS far_outlier
FROM houseprice h RIGHT OUTER JOIN a
     ON a.year_of_sale = h.year_of_sale AND a.postcode_district = h.postcode_district
WHERE h.postcode_district = 'GL50'
)

SELECT year_of_sale AS year, postcode_district AS id,
       MEDIAN(price2014), MIN(price2014), MAX(price2014),
       (calc_quartiles(array_agg(price2014::real))).max as max_range,
       COUNT(CASE WHEN b.group <= 0 THEN 1 END) AS r1,
       COUNT(CASE WHEN b.group = 1 THEN 1 END) AS r2,
       COUNT(CASE WHEN b.group = 2 THEN 1 END) AS r3,
       COUNT(CASE WHEN b.group = 3 THEN 1 END) AS r4,
       COUNT(CASE WHEN b.group = 4 THEN 1 END) AS r5,
       COUNT(CASE WHEN b.group = 5 THEN 1 END) AS r6,
       COUNT(CASE WHEN b.group > 5 THEN 1 END) AS outlier
FROM b WHERE postcode_district = 'GL50' AND year_of_sale != '2015'
GROUP BY year, postcode_district
ORDER BY year
```

You will need this function:
```sql
DROP FUNCTION calc_quartiles(real[]);
DROP TYPE quartiles;

CREATE TYPE quartiles AS (
  q1 real,
  q3 real,
  iqr real,
  min real,
  max real,
  lower_fence real,
  upper_fence real,
  outer_fence real
);

CREATE OR REPLACE FUNCTION calc_quartiles(myarray real[])
  RETURNS quartiles AS
$BODY$

DECLARE
  ary_cnt INTEGER;
  new_array real[];
  half INTEGER;
  qtr INTEGER;
  q quartiles;
  i real;
BEGIN
  ary_cnt = array_length(myarray, 1);
  new_array = array_sort(myarray);

  half = ary_cnt / 2;
  if half & 1 then
    qtr = (half + 1) / 2;
    q.q1 = new_array[qtr];
    q.q3 = new_array[ary_cnt - qtr + 1];
  else
    qtr = half / 2;
    q.q1 = (new_array[qtr] + new_array[qtr + 1]) / 2;
    q.q3 = (new_array[ary_cnt - qtr] + new_array[ary_cnt - qtr + 1]) / 2;
  end if;
  
  q.iqr = q.q3 - q.q1;
  q.lower_fence = q.q1 - 1.5 * q.iqr;
  q.upper_fence = q.q3 + 1.5 * q.iqr;
  q.outer_fence = q.q3 + 3 * q.iqr;

  q.min = new_array[1];
  foreach i in array new_array loop
    exit when i > q.upper_fence;
    q.max = i;
  end loop;
  
  return q;
END;
$BODY$
  LANGUAGE plpgsql IMMUTABLE
  COST 100;
ALTER FUNCTION calc_quartiles(real[])
  OWNER TO users;
```
