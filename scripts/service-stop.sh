#!/bin/sh

port_number=$($(dirname $0)/port_number.sh)
fuser -k $port_number/tcp

