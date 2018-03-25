#!/bin/sh

echo "Running $0 ..."
CURDIR=$(dirname $(realpath $0))
TOPDIR=$(realpath $CURDIR/..)

[ -d "$TOPDIR/node_modules" ] || npm install
mkdir -p $TOPDIR/data

