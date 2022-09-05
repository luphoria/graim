#!/bin/bash
hugo -D
docker login
docker build . -t motortruck1221/graimdocs
read -p "Enter the docker image id:" dname
dcmd=`docker run -d -p 80:80 $dname`
echo $dcmd
docker stop $dcmd
docker push motortruck1221/graimdocs:latest
docker rm $dcmd