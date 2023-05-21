#!/bin/bash
cd /root/SaveYang_repo/track-tire-backend

git pull

echo  Pull finished

sleep 1

cd /root/SaveYang_service/track_tire_backend/docker/out/app

rm -f main.js

echo  del main.js finished

cp -r /root/SaveYang_repo/track-tire-backend/dist/main.js  /root/SaveYang_service/track_tire_backend/docker/out/app
sleep 1

echo  copy main.js finished

cd /root/SaveYang_service/track_tire_backend/docker/ 
docker stop track_tire_backend
docker rm track_tire_backend 
docker rmi track_tire_backend 
docker build --no-cache -t track_tire_backend .
docker run --name track_tire_backend \
-v /root/SaveYang_service/track_tire_backend/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service/track_tire_backend/logs:/usr/src/app/logs \
-d -p 65121:3000 track_tire_backend


docker ps -a

echo  run docker finished