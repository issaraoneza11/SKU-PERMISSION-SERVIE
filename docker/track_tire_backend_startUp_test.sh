#!/bin/bash
cd /root/SaveYang_repo_test
gh repo clone panyawutt/track-tire-backend
sleep 3
 cp -r /root/SaveYang_repo_test/track-tire-backend/docker/docker_dir/track_tire_backend      /root/SaveYang_service_test/
sleep 1
 mkdir /root/SaveYang_service_test/track_tire_backend/shard
 mkdir /root/SaveYang_service_test/track_tire_backend/logs
 mkdir /root/SaveYang_service_test/track_tire_backend/uploads
cd /root
 sleep 2
bash /root/SaveYang_service_test/track_tire_backend/docker/newInstall_test.sh