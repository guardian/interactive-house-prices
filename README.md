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

## Convert Shapefile to TopoJSON

```topojson --id-property name --simplify-proportion 0.1 Areas.shp > areas-topo.json```

## Queries

NOTE: The table `houseprice_test` has a reduced dataset for testing, use instead of `houseprice` for
faster results

House prices broken down by postcode area
```
SELECT EXTRACT(year FROM date_of_sale) AS year,
       EXTRACT(month FROM date_of_sale) AS month,
       postcode_area, AVG(price), COUNT(*)
FROM houseprice WHERE postcode_area != ''
GROUP BY year, month, postcode_area
ORDER BY year, month
```
```
SELECT EXTRACT(year FROM date_of_sale) AS year,
       postcode_area, AVG(price), MIN(price), MAX(price), COUNT(*),
       median(price) AS median_value
FROM houseprice_test WHERE postcode_area != ''
GROUP BY year, postcode_area
ORDER BY year
```
