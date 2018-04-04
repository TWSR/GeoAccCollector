#!/bin/sh

port_number=$($(dirname $0)/port_number.sh)
fuser -k $port_number/tcp

mkdir -p ../logs
nohup npm start >../logs/npm_start.log 2>&1 &
echo $! > ../logs/npm_start.pid
fuser $port_number/tcp

