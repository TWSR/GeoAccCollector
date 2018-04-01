#!/bin/sh

mkdir -p ../logs
nohup npm start >../logs/npm_start.log 2>&1 &
echo $! > ../logs/npm_start.pid
fuser 8443/tcp

