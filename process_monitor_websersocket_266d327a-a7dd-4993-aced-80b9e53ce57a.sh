pid_websersocket=$(pgrep -f "websersocket_266d327a-a7dd-4993-aced-80b9e53ce57a.js")
watch -n 1 ps -p $pid_websersocket -o pid,etime,%cpu,%mem,cmd