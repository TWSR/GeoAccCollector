#!/bin/sh

project_dir=$(realpath $(dirname $0)/..)
node_cmd=$(printf "var config=require('%s/config.json');console.log(config.port_number)" $project_dir)
port_number=$(node -e "$node_cmd")
echo $port_number
