#!/bin/bash

./split.py ^[A-Z]+ < data/districts.json
./split.py "^[^ ]+" < data/sectors.json
