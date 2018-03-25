#!/bin/sh

echo "Running $0 ..."
CURDIR=$(dirname $(realpath $0))
TOPDIR=$(realpath $CURDIR/..)

[ -d "$TOPDIR/node_modules" ] || rm -rf $TOPDIR/node_modules
rm -rf $TOPDIR/data

