# House prices

You need to install `pngquant`, then run:
```
./start.sh
```

## Queries

NOTE: The table `houseprice_test` has a reduced dataset for testing, use instead of `houseprice` for
faster results

The quick query (no ranges in tooltip)
```
SELECT EXTRACT(year FROM date_of_sale) AS year,
       postcode_district AS id,
       MEDIAN(price2014), MIN(price2014), MAX(price2014), COUNT(*)
FROM houseprice WHERE postcode_district != ''
GROUP BY year, postcode_district
ORDER BY year
```

The full query
```
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
       FLOOR((price2014 - a.lower_fence) / ((a.upper_fence - a.lower_fence) / 6)) AS group
FROM houseprice h RIGHT OUTER JOIN a
     ON a.year_of_sale = h.year_of_sale AND a.postcode_district = h.postcode_district
WHERE h.postcode_district = 'GL50'
)

SELECT year_of_sale AS year, postcode_district AS id,
       MIN(price2014), MAX(price2014), MEDIAN(price2014), COUNT(*),
       (calc_quartiles(array_agg(price2014::real))).*,
       COUNT(CASE WHEN b.group < 0 THEN 1 END) AS r0,
       COUNT(CASE WHEN b.group = 0 THEN 1 END) AS r1,
       COUNT(CASE WHEN b.group = 1 THEN 1 END) AS r2,
       COUNT(CASE WHEN b.group = 2 THEN 1 END) AS r3,
       COUNT(CASE WHEN b.group = 3 THEN 1 END) AS r4,
       COUNT(CASE WHEN b.group = 4 THEN 1 END) AS r5,
       COUNT(CASE WHEN b.group = 5 THEN 1 END) AS r6,
       COUNT(CASE WHEN b.group > 5 THEN 1 END) AS r7
FROM b WHERE postcode_district = 'GL50'
GROUP BY year, postcode_district
ORDER BY year
```
