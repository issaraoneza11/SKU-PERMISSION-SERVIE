#!/bin/bash

 
cd /root/SaveYang_repo

gh repo clone panyawutt/track-tire-backend

sleep 3

 cp -r /root/SaveYang_repo/track-tire-backend/docker/docker_dir/track_tire_backend      /root/SaveYang_service/

sleep 1
 mkdir /root/SaveYang_service/track_tire_backend/shard
 mkdir /root/SaveYang_service/track_tire_backend/logs
 mkdir /root/SaveYang_service/track_tire_backend/uploads

cd ~
 

 sleep 2

bash /root/SaveYang_service/track_tire_backend/docker/newInstall.sh

echo  run newInstall finished