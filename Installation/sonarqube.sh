#!/bin/bash

docker volume create --name sonarqube_data
docker volume create --name sonarqube_logs
docker volume create --name sonarqube_extensions

sudo sysctl -w vm.max_map_count=524288
sudo sysctl -w fs.file-max=131072

docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  --ulimit nofile=131072:131072 \
  --ulimit nproc=8192:8192 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube
