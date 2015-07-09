# House prices

```
unzip data.zip
node process.js
```

## Generate PNG sprite

You need to install `pngquant`, then run:
```
./generate.sh
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
