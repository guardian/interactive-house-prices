# House prices

You need to install `pngquant`, then run:
```
./start.sh
```

## Queries

NOTE: The table `houseprice_test` has a reduced dataset for testing, use instead of `houseprice` for
faster results

House prices broken down by postcode district
```
SELECT EXTRACT(year FROM date_of_sale) AS year,
       postcode_district AS id,
       MEDIAN(price), MIN(price), MAX(price), COUNT(*)
FROM houseprice WHERE postcode_district != ''
GROUP BY year, postcode_district
ORDER BY year
```
```
WITH a AS ( 
SELECT year_of_sale AS year,
       postcode_district AS id,
       MIN(price) AS min,
       MAX(price) - MIN(price) AS diff
FROM houseprice WHERE postcode_district = 'E1'
GROUP BY year_of_sale, postcode_district
),
b AS (
SELECT year_of_sale AS year,
       postcode_district AS id,
       price, (price - a.min) / (a.diff / 6) AS group
FROM houseprice RIGHT OUTER JOIN a ON a.year = year_of_sale AND a.id = postcode_district
WHERE postcode_district = 'E1'
)

SELECT year, id,
       MIN(price), MAX(price), MEDIAN(price), COUNT(*),
       COUNT(CASE WHEN b.group = 0 THEN 1 END) AS r1, 
       COUNT(CASE WHEN b.group = 1 THEN 1 END) AS r2,
       COUNT(CASE WHEN b.group = 2 THEN 1 END) AS r3,
       COUNT(CASE WHEN b.group = 3 THEN 1 END) AS r4,
       COUNT(CASE WHEN b.group = 4 THEN 1 END) AS r5,
       COUNT(CASE WHEN b.group = 5 OR b.group = 6 THEN 1 END) AS r6
FROM b WHERE id = 'E1'
GROUP BY year, id
ORDER BY year
```
