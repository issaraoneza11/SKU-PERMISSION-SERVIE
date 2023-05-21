#!/bin/bash
cd /root/SaveYang_service_test/track_tire_backend/docker/

sleep 1
docker build --no-cache -t track_tire_backend_test .
sleep 1

docker run --name track_tire_backend_test \
-v /root/SaveYang_service_test/track_tire_backend/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service_test/track_tire_backend/logs:/usr/src/app/logs \
-d -p 5553:3000 track_tire_backend_test


docker ps

docker ps -a 
