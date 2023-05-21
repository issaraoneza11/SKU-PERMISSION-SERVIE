#!/bin/bash

cd /root/SaveYang_repo_test/track-tire-backend

git pull

echo  Pull finished

sleep 1

cd /root/SaveYang_service_test/track_tire_backend/docker/out/app

rm main.js

echo  del main.js finished

cp -r /root/SaveYang_repo_test/track-tire-backend/dist/main.js  /root/SaveYang_service_test/track_tire_backend/docker/out/app
sleep 1

echo  copy main.js finished

cd /root/SaveYang_service_test/track_tire_backend/docker/ 

docker stop track_tire_backend_test
docker rm track_tire_backend_test 
docker rmi track_tire_backend_test 
docker build --no-cache -t track_tire_backend_test .
docker run --name track_tire_backend_test \
-v /root/SaveYang_service_test/track_tire_backend/uploads:/usr/src/app/uploads \
-v /root/SaveYang_service_test/track_tire_backend/logs:/usr/src/app/logs \
-d -p 5553:3000 track_tire_backend_test


docker ps -a

echo  run docker finished