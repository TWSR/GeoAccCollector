#!/bin/sh

find $(dirname $0)/../data -name "*.json" -exec node $(dirname $0)/../json2csv.js {} \;
mkdir -p $(dirname $0)/../data/csv
mv $(dirname $0)/../data/*.csv $(dirname $0)/../data/csv
