#!/bin/bash
cd /root/SaveYang_service/track_tire_backend/docker/

sleep 1
docker build --no-cache -t track_tire_backend .
sleep 1

docker run --name track_tire_backend \
-v /root/SaveYang_service/track_tire_backend/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service/track_tire_backend/logs:/usr/src/app/logs \
-d -p 65121:3000 track_tire_backend


docker ps

docker ps -a 
